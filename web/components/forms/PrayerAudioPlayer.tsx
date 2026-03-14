"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";

function formatPlayerTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
    if (!audio) return;
    audio.volume = volume;
    audio.muted = volume === 0;
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

  const progressValue = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  return (
    <div
      className="prayer-audio-player"
      tabIndex={0}
      role="group"
      aria-label={`${title} audio player`}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          void togglePlayback();
          return;
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          seekTo(Math.min(duration, currentTime + 10));
          return;
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          seekTo(Math.max(0, currentTime - 10));
        }
      }}
    >
      <audio ref={audioRef} preload="none" src={src} />
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
      <div className="prayer-audio-player__rail" aria-hidden="true">
        <span
          className={cn("prayer-audio-player__wave", "prayer-audio-player__wave--short")}
        />
        <span
          className={cn("prayer-audio-player__wave", "prayer-audio-player__wave--tall")}
        />
        <span className="prayer-audio-player__wave" />
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
        <div className="prayer-audio-player__times">
          <span>{formatPlayerTime(currentTime)}</span>
          <span>{formatPlayerTime(duration)}</span>
        </div>
      </div>
      <label className="prayer-audio-player__volume">
        <span className="prayer-audio-player__volume-label">Volume</span>
        <input
          aria-label="Prayer audio volume"
          className="prayer-audio-player__volume-range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(volume * 100)}
          onChange={(event) => updateVolume(Number(event.target.value) / 100)}
          style={{ ["--progress" as string]: `${Math.round(volume * 100)}%` }}
        />
        <span className="prayer-audio-player__volume-value">{Math.round(volume * 100)}%</span>
      </label>
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
    </div>
  );
}
