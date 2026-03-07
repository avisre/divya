import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { Button } from "@/components/ui/Button";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";

export default function PrayerDetailPage() {
  const { slug = "" } = useParams();
  const [tab, setTab] = useState<"script" | "iast" | "meaning">("script");
  const [status, setStatus] = useState("");
  const player = useAudioPlayer();
  const prayer = useQuery({
    queryKey: ["prayer", slug],
    queryFn: () => publicApi.prayer(slug),
    enabled: Boolean(slug)
  });
  const audio = useQuery({
    queryKey: ["prayer-audio", prayer.data?._id],
    queryFn: () => publicApi.prayerAudio(prayer.data!._id),
    enabled: Boolean(prayer.data?._id)
  });
  const favoriteMutation = useMutation({
    mutationFn: () => publicApi.favoritePrayer(prayer.data!._id),
    onSuccess: () => setStatus("Prayer added to favorites.")
  });
  const audioComingSoonMutation = useMutation({
    mutationFn: () => publicApi.subscribeAudioComingSoon(prayer.data!._id),
    onSuccess: () => setStatus("You will be notified when audio is ready.")
  });

  const scriptContent = useMemo(() => {
    if (!prayer.data) return "";
    return prayer.data.content.devanagari || prayer.data.content.malayalam || prayer.data.content.english || "";
  }, [prayer.data]);

  const lines = useMemo(() => scriptContent.split("\n").filter(Boolean), [scriptContent]);
  const samePrayerLoaded = prayer.data?._id ? player.prayer?._id === prayer.data._id : false;
  const activeLineIndex = useMemo(() => {
    if (!samePrayerLoaded || !player.isPlaying || !prayer.data?.verseTimings?.length) return -1;
    const currentMs = player.currentTime * 1000;
    const currentTiming = prayer.data.verseTimings.find(
      (timing) => currentMs >= timing.startMs && currentMs <= timing.endMs
    );
    return currentTiming?.lineIndex ?? -1;
  }, [player.currentTime, player.isPlaying, prayer.data?.verseTimings, samePrayerLoaded]);
  const audioReady = Boolean(audio.data?.streamUrl || audio.data?.url);
  const sourceLabel = useMemo(() => {
    if (!audio.data?.sourceLabel) return "";
    if (audio.data.sourceLabel === "bundled_or_local") return "local devotional library";
    return audio.data.sourceLabel.replace(/_/g, " ");
  }, [audio.data?.sourceLabel]);
  const codecLabel =
    !audio.data?.codec || audio.data.codec === "application/octet-stream"
      ? "streamed playback"
      : audio.data.codec;

  if (prayer.isLoading) {
    return <div className="page-state">Loading prayer...</div>;
  }

  if (prayer.isError || !prayer.data) {
    return (
      <div className="page-stack">
        <StatusStrip tone="warning">Prayer details could not be loaded right now.</StatusStrip>
        <SectionCard title="Try again">
          <div className="inline-actions">
            <Button tone="secondary" onClick={() => prayer.refetch()}>
              Retry
            </Button>
            <Link to="/prayers" className="btn btn-primary">
              Back to prayer library
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <HeroSection
        eyebrow={`${prayer.data.type} | ${prayer.data.difficulty}`}
        title={prayer.data.title.en}
        subtitle={prayer.data.beginnerNote || prayer.data.meaning || "A guided devotional prayer."}
        actions={
          <>
            {audioReady ? (
              <Button onClick={() => audio.data && void player.playPrayer(prayer.data, audio.data)}>Play audio</Button>
            ) : (
              <Button tone="secondary" onClick={() => audioComingSoonMutation.mutate()}>
                Audio coming soon
              </Button>
            )}
            {samePrayerLoaded ? (
              <Button tone="secondary" onClick={() => player.setDrawerOpen(true)}>
                Open player
              </Button>
            ) : null}
            <Button tone="secondary" onClick={() => favoriteMutation.mutate()}>
              Favorite
            </Button>
          </>
        }
      >
        <div className="hero-side-card">
          <div className="eyebrow">Prayer rhythm</div>
          <div className="metric-grid compact-grid">
            <div className="metric-card">
              <strong>{prayer.data.durationMinutes} min</strong>
              <span>Duration</span>
            </div>
            <div className="metric-card">
              <strong>{prayer.data.requiredTier || "free"}</strong>
              <span>Tier</span>
            </div>
            <div className="metric-card">
              <strong>{prayer.data.recommendedRepetitions?.[0] || 1}</strong>
              <span>Recommended start</span>
            </div>
            <div className="metric-card">
              <strong>{audioReady ? "Ready" : "Soon"}</strong>
              <span>Audio status</span>
            </div>
          </div>
          <div className="info-note">
            Begin with audio once, then continue with script and transliteration together. The mini-player keeps your place across the site.
          </div>
        </div>
      </HeroSection>

      <SectionCard title="Listen and settle in" subtitle="Start with the guided audio, then stay with the text while playback continues across routes.">
        <div className="split-layout">
          <div className="stack-form">
            {audioReady ? (
              <StatusStrip tone="success">
                Audio ready | {audio.data?.qualityLabel} quality | {sourceLabel} | {codecLabel}
              </StatusStrip>
            ) : (
              <StatusStrip tone="warning">Audio is not available for this prayer yet.</StatusStrip>
            )}
            <div className="inline-actions">
              <Button
                disabled={!audioReady}
                onClick={() => audio.data && void player.playPrayer(prayer.data, audio.data)}
              >
                {audioReady ? "Play from start" : "Audio unavailable"}
              </Button>
              {samePrayerLoaded ? (
                <Button tone="secondary" onClick={() => player.setDrawerOpen(true)}>
                  Open full player
                </Button>
              ) : null}
            </div>
          </div>
          <div className="stack-form">
            <article className="content-card accent-card">
              <div className="eyebrow">How to use it</div>
              <h3>Listen once, then repeat slowly.</h3>
              <p>
                This page is arranged so audio, script, transliteration, and repetition stay in one place. Start with one repetition, then build up.
              </p>
            </article>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Read along"
        subtitle={
          prayer.data.verseTimings?.length
            ? "Switch between script, transliteration, and meaning. Active lines highlight during playback."
            : "Switch between script, transliteration, and meaning."
        }
      >
        <div className="split-layout prayer-reading-layout">
          <div className="stack-form">
            <div className="chip-row">
              <button
                type="button"
                className={`filter-chip ${tab === "script" ? "active" : ""}`}
                onClick={() => setTab("script")}
              >
                Script
              </button>
              <button
                type="button"
                className={`filter-chip ${tab === "iast" ? "active" : ""}`}
                onClick={() => setTab("iast")}
              >
                IAST
              </button>
              <button
                type="button"
                className={`filter-chip ${tab === "meaning" ? "active" : ""}`}
                onClick={() => setTab("meaning")}
              >
                Meaning
              </button>
            </div>
            <div className={`verse-panel ${tab === "script" ? "script-panel" : ""}`}>
              {tab === "script"
                ? lines.map((line, index) => (
                  <p key={`${line}-${index}`} className={`verse-line ${index === activeLineIndex ? "active" : ""}`}>
                    {line}
                  </p>
                ))
                : tab === "iast"
                  ? <p>{prayer.data.iast || prayer.data.transliteration || "IAST not available yet."}</p>
                  : <p>{prayer.data.meaning || prayer.data.content.english || "Meaning not available yet."}</p>}
            </div>
          </div>
          <div className="stack-form">
            <article className="content-card">
              <div className="eyebrow">Reading mode</div>
              <h3>{tab === "script" ? "Sacred script" : tab === "iast" ? "Pronunciation support" : "Meaning and context"}</h3>
              <p>
                {tab === "script"
                  ? "Use the original script when you want devotional familiarity and stronger line-by-line focus."
                  : tab === "iast"
                    ? "Use transliteration to keep the sound pattern accurate even if the original script is less familiar."
                    : "Use meaning when praying with children or when you want the emotional context of each line."}
              </p>
            </article>
            {prayer.data.verseTimings?.length ? (
              <StatusStrip tone="neutral">
                Active line highlighting follows the audio for this prayer.
              </StatusStrip>
            ) : (
              <StatusStrip tone="neutral">
                This prayer supports text reading now. Line-by-line sync will appear when timing data is added.
              </StatusStrip>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Chant and count"
        subtitle="Use the persistent player for speed, repetitions, and continued playback across routes."
      >
        <div className="split-layout">
          <div className="stack-form">
            <div className="chip-row">
              {(prayer.data.recommendedRepetitions || [1, 3, 7, 11, 21, 51, 108]).map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`filter-chip ${player.repetitionsTarget === count ? "active" : ""}`}
                  onClick={() => player.setRepetitionsTarget(count)}
                >
                  {count} repetitions
                </button>
              ))}
            </div>
            {samePrayerLoaded ? (
              <StatusStrip tone="neutral">
                Current session: {player.repetitionsCompleted}/{player.repetitionsTarget} repetitions completed.
              </StatusStrip>
            ) : null}
          </div>
          <div className="stack-form">
            <article className="content-card accent-card">
              <div className="eyebrow">Practice guidance</div>
              <h3>Keep the count simple and auspicious.</h3>
              <p>Start with 1 or 3 repetitions. Move to 11 or 21 only after the pronunciation and rhythm feel natural.</p>
            </article>
          </div>
        </div>
      </SectionCard>

      {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
    </div>
  );
}
