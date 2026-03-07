import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Prayer, PrayerAudioMetadata } from "@/lib/types";
import { userApi } from "@/lib/api";

type PlayerState = {
  prayer: Prayer | null;
  metadata: PrayerAudioMetadata | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  rate: number;
  repetitionsTarget: number;
  repetitionsCompleted: number;
  drawerOpen: boolean;
  playPrayer: (prayer: Prayer, metadata: PrayerAudioMetadata, autoPlay?: boolean) => Promise<void>;
  togglePlayback: () => void;
  seek: (seconds: number) => void;
  setRate: (rate: number) => void;
  setDrawerOpen: (open: boolean) => void;
  setRepetitionsTarget: (value: number) => void;
  markLoopComplete: () => void;
  close: () => void;
};

const AudioPlayerContext = createContext<PlayerState | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [prayer, setPrayer] = useState<Prayer | null>(null);
  const [metadata, setMetadata] = useState<PrayerAudioMetadata | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRateValue] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [repetitionsTarget, setRepetitionsTarget] = useState(21);
  const [repetitionsCompleted, setRepetitionsCompleted] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setRepetitionsCompleted((prev) => {
        const next = prev + 1;
        if (next < repetitionsTarget) {
          audio.currentTime = 0;
          void audio.play();
        } else {
          void userApi.prayerComplete({
            prayerId: prayer?._id,
            durationSeconds: Math.round(audio.duration || 0)
          }).catch(() => undefined);
        }
        return next;
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [prayer?._id, repetitionsTarget]);

  const value = useMemo<PlayerState>(
    () => ({
      prayer,
      metadata,
      isPlaying,
      currentTime,
      duration,
      rate,
      repetitionsTarget,
      repetitionsCompleted,
      drawerOpen,
      async playPrayer(nextPrayer, nextMetadata, autoPlay = true) {
        const audio = audioRef.current;
        const playbackUrl = nextMetadata.streamUrl || nextMetadata.url;
        if (!audio || !playbackUrl) return;
        setPrayer(nextPrayer);
        setMetadata(nextMetadata);
        setRepetitionsCompleted(0);
        audio.src = playbackUrl;
        audio.playbackRate = rate;
        setDrawerOpen(false);
        if (autoPlay) {
          await audio.play();
        }
      },
      togglePlayback() {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
          void audio.play();
        } else {
          audio.pause();
        }
      },
      seek(seconds) {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || seconds));
      },
      setRate(nextRate) {
        const audio = audioRef.current;
        setRateValue(nextRate);
        if (audio) {
          audio.playbackRate = nextRate;
        }
      },
      setDrawerOpen,
      setRepetitionsTarget,
      markLoopComplete() {
        setRepetitionsCompleted((prev) => prev + 1);
      },
      close() {
        const audio = audioRef.current;
        audio?.pause();
        if (audio) {
          audio.src = "";
        }
        setPrayer(null);
        setMetadata(null);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setDrawerOpen(false);
        setRepetitionsCompleted(0);
      }
    }),
    [currentTime, drawerOpen, duration, isPlaying, metadata, prayer, rate, repetitionsCompleted, repetitionsTarget]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return context;
}
