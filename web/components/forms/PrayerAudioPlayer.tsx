"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";

function formatPlayerTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function SignalIcon() {
  return (
    <svg
      aria-hidden="true"
      className="prayer-audio-player__signal-icon"
      viewBox="0 0 28 28"
      fill="none"
    >
      <rect x="3" y="13" width="4" height="12" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="12" y="7" width="4" height="18" rx="2" fill="currentColor" />
      <rect x="21" y="10" width="4" height="15" rx="2" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 10H8L13 6V18L8 14H4V10Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M17 9L21 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M21 9L17 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  const innerArc =
    volume > 0.5
      ? "M16.8 10C18 10.9 18.8 12.4 18.8 14C18.8 15.6 18 17.1 16.8 18"
      : "M16.2 11.4C16.9 12.1 17.3 13 17.3 14C17.3 15 16.9 15.9 16.2 16.6";

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10H8L13 6V18L8 14H4V10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={innerArc}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {volume > 0.5 ? (
        <path
          d="M18.8 7.5C20.7 9 21.9 11.4 21.9 14C21.9 16.6 20.7 19 18.8 20.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}

export function PrayerAudioPlayer({
  src,
  title,
  onProgress,
  onNearComplete
}: {
  src: string;
  title: string;
  onProgress?: (payload: { currentTime: number; duration: number }) => void;
  onNearComplete?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const nearCompleteFiredRef = useRef(false);
  const lastAudibleVolumeRef = useRef(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const syncTime = () => setCurrentTime(audio.currentTime || 0);
    const syncDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (!audio) return;
      try {
        audio.pause();
      } catch {
        // jsdom does not implement media teardown fully.
      }
      audio.removeAttribute("src");
      try {
        audio.load();
      } catch {
        // jsdom does not implement media teardown fully.
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = volume === 0;
  }, [volume]);

  useEffect(() => {
    if (volume > 0) {
      lastAudibleVolumeRef.current = volume;
    }
  }, [volume]);

  useEffect(() => {
    onProgress?.({ currentTime, duration });
    if (!nearCompleteFiredRef.current && duration > 0 && currentTime / duration >= 0.8) {
      nearCompleteFiredRef.current = true;
      onNearComplete?.();
    }
  }, [currentTime, duration, onNearComplete, onProgress]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }
    audio.pause();
    setIsPlaying(false);
  }

  function seekTo(nextValue: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = nextValue;
    setCurrentTime(nextValue);
  }

  function updatePlaybackRate(nextValue: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = nextValue;
    setPlaybackRate(nextValue);
  }

  function updateVolume(nextValue: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = nextValue;
    audio.muted = nextValue === 0;
    setVolume(nextValue);
  }

  function toggleMute() {
    if (volume === 0) {
      updateVolume(lastAudibleVolumeRef.current || 0.6);
      return;
    }

    lastAudibleVolumeRef.current = volume;
    updateVolume(0);
  }

  const progressValue = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const volumeValue = Math.round(volume * 100);

  return (
    <div className="prayer-audio-player" role="group" aria-label={`${title} audio player`}>
      <audio ref={audioRef} preload="none" src={src} />
      <div className="prayer-audio-player__transport">
        <button
          type="button"
          className="prayer-audio-player__toggle"
          onClick={() => {
            void togglePlayback();
          }}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? "\u275A\u275A" : "\u25B6"}
        </button>
        <div className="prayer-audio-player__transport-body">
          <div className="prayer-audio-player__trackline">
            <div className="prayer-audio-player__rail" aria-hidden="true">
              <SignalIcon />
              <span className="prayer-audio-player__wave-cluster">
                <span className={cn("prayer-audio-player__wave", "prayer-audio-player__wave--short")} />
                <span className={cn("prayer-audio-player__wave", "prayer-audio-player__wave--tall")} />
                <span className="prayer-audio-player__wave" />
              </span>
            </div>
            <div className="prayer-audio-player__times">
              <span>{formatPlayerTime(currentTime)}</span>
              <span>{formatPlayerTime(duration)}</span>
            </div>
          </div>
          <div className="prayer-audio-player__timeline">
            <input
              aria-label="Seek prayer audio"
              className="prayer-audio-player__range"
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={currentTime}
              onChange={(event) => seekTo(Number(event.target.value))}
              style={{ ["--progress" as string]: `${progressValue}%` }}
            />
          </div>
          <div className="prayer-audio-player__controls">
            <div className="prayer-audio-player__speeds" role="group" aria-label="Playback speed">
              {[0.75, 1, 1.25].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  className={cn("chip-toggle", playbackRate === speed && "chip-toggle--active")}
                  onClick={() => updatePlaybackRate(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <div className="prayer-audio-player__volume-shell">
              <button
                type="button"
                className="prayer-audio-player__volume-toggle"
                aria-label={volume === 0 ? "Unmute prayer audio" : "Mute prayer audio"}
                onClick={toggleMute}
              >
                <VolumeIcon volume={volume} />
              </button>
              <div className="prayer-audio-player__volume">
                <input
                  aria-label="Prayer audio volume"
                  className="prayer-audio-player__volume-range"
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={volumeValue}
                  onChange={(event) => updateVolume(Number(event.target.value) / 100)}
                  style={{ ["--progress" as string]: `${volumeValue}%` }}
                />
              </div>
              <span className="prayer-audio-player__volume-value">{volumeValue}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
