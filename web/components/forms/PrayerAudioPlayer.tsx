"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";

type AudioLoadState = "idle" | "loading" | "ready" | "playing" | "error";
const HAVE_CURRENT_DATA = 2;

function formatPlayerTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getMediaErrorMessage(error: MediaError | null | undefined) {
  if (!error) {
    return "Playback did not start. Use the native controls below if needed.";
  }

  switch (error.code) {
    case error.MEDIA_ERR_ABORTED:
      return "Playback was interrupted before the audio could start.";
    case error.MEDIA_ERR_NETWORK:
      return "The prayer audio could not be loaded over the network.";
    case error.MEDIA_ERR_DECODE:
      return "The prayer audio file could not be decoded by this browser.";
    case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return "This browser does not support the prayer audio source.";
    default:
      return "Playback did not start. Use the native controls below if needed.";
  }
}

function waitForAudioReady(audio: HTMLAudioElement) {
  if (audio.readyState >= HAVE_CURRENT_DATA) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      audio.removeEventListener("loadeddata", handleReady);
      audio.removeEventListener("canplay", handleReady);
      audio.removeEventListener("error", handleError);
      window.clearTimeout(timeoutId);
    };

    const handleReady = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(new Error(getMediaErrorMessage(audio.error)));
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("The prayer audio took too long to become ready."));
    }, 10000);

    audio.addEventListener("loadeddata", handleReady, { once: true });
    audio.addEventListener("canplay", handleReady, { once: true });
    audio.addEventListener("error", handleError, { once: true });
  });
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
  onNearComplete,
  onPlaybackChange
}: {
  src: string;
  title: string;
  onProgress?: (payload: { currentTime: number; duration: number }) => void;
  onNearComplete?: () => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [loadState, setLoadState] = useState<AudioLoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNativeControls, setShowNativeControls] = useState(false);
  const nearCompleteFiredRef = useRef(false);
  const lastAudibleVolumeRef = useRef(1);
  const onProgressRef = useRef(onProgress);
  const onNearCompleteRef = useRef(onNearComplete);
  const onPlaybackChangeRef = useRef(onPlaybackChange);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onNearCompleteRef.current = onNearComplete;
  }, [onNearComplete]);

  useEffect(() => {
    onPlaybackChangeRef.current = onPlaybackChange;
  }, [onPlaybackChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const syncTime = () => setCurrentTime(audio.currentTime || 0);
    const syncDuration = () => setDuration(audio.duration || 0);
    const handleLoadStart = () => {
      setLoadState("loading");
      setErrorMessage(null);
    };
    const handleCanPlay = () => {
      setLoadState((current) => (audio.paused ? (current === "error" ? current : "ready") : "playing"));
    };
    const handleWaiting = () => {
      if (!audio.paused) {
        setLoadState("loading");
      }
    };
    const handlePlay = () => {
      setIsPlaying(true);
      setLoadState("playing");
      setErrorMessage(null);
      onPlaybackChangeRef.current?.(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setLoadState(audio.ended ? "ready" : audio.readyState >= HAVE_CURRENT_DATA ? "ready" : "idle");
      onPlaybackChangeRef.current?.(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setLoadState("ready");
      onPlaybackChangeRef.current?.(false);
    };
    const handleError = () => {
      setIsPlaying(false);
      setLoadState("error");
      setErrorMessage(getMediaErrorMessage(audio.error));
      setShowNativeControls(true);
      onPlaybackChangeRef.current?.(false);
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("loadeddata", handleCanPlay);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("loadeddata", handleCanPlay);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    nearCompleteFiredRef.current = false;
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setLoadState("idle");
    setErrorMessage(null);
    setShowNativeControls(false);
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (!audio) return;
      try {
        audio.pause();
      } catch {
        // jsdom does not implement media teardown fully.
      }
      // Clearing the source is enough on teardown. Forcing `load()` here can
      // trigger a browser AbortError while the current fetch is being cancelled.
      audio.removeAttribute("src");
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
    onProgressRef.current?.({ currentTime, duration });
    if (!nearCompleteFiredRef.current && duration > 0 && currentTime / duration >= 0.8) {
      nearCompleteFiredRef.current = true;
      onNearCompleteRef.current?.();
    }
  }, [currentTime, duration]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        setErrorMessage(null);
        setLoadState("loading");
        if (audio.readyState < HAVE_CURRENT_DATA) {
          audio.load();
          await waitForAudioReady(audio);
        }
        await audio.play();
      } catch (error) {
        setIsPlaying(false);
        setLoadState("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Playback did not start. Use the native controls below if needed."
        );
        setShowNativeControls(true);
        onPlaybackChangeRef.current?.(false);
      }
      return;
    }
    audio.pause();
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
  const statusText =
    errorMessage ||
    (loadState === "playing"
      ? "Playing now"
      : loadState === "loading"
        ? "Preparing audio..."
        : loadState === "ready"
          ? "Audio ready"
          : "Tap play to begin");

  return (
    <div className="prayer-audio-player" role="group" aria-label={`${title} audio player`}>
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        controls={showNativeControls}
        className={cn(
          "prayer-audio-player__native",
          showNativeControls && "prayer-audio-player__native--visible"
        )}
        src={src}
      />
      <div className="prayer-audio-player__transport">
        <button
          type="button"
          data-guided-target="prayer-audio-toggle"
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
      <div className="prayer-audio-player__status-row">
        <span
          className={cn(
            "prayer-audio-player__status",
            loadState === "error" && "prayer-audio-player__status--error"
          )}
        >
          {statusText}
        </span>
        <button
          type="button"
          className="prayer-audio-player__fallback-link"
          onClick={() => setShowNativeControls((current) => !current)}
        >
          {showNativeControls ? "Hide native controls" : "Use native controls"}
        </button>
      </div>
    </div>
  );
}
