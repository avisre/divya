"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sendJson } from "../../lib/client-api";
import { cn } from "../../lib/cn";
import { resolvePlayableAudioUrl } from "../../lib/media";
import { getPrayerDifficultyMeta } from "../../lib/presentation";
import { trackEvent } from "../../lib/analytics";
import { formatBillingPrice, getBillingPriceForTier } from "../../lib/subscription-plans";
import type {
  GamificationResult,
  Prayer,
  PrayerAudioMetadata,
  PrayerGlossaryEntry,
  PrayerVerse
} from "../../lib/types";
import { wasDismissedWithinDays } from "../../lib/ux-state";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";
import { PrayerAudioPlayer } from "./PrayerAudioPlayer";
import { useGuidedFlow } from "../ux/GuidedFlowProvider";
import { useUx } from "../ux/UxProvider";

type TabKey = "script" | "follow" | "meaning" | "about";
const COMPLETION_NUDGE_SESSION_KEY = "prarthana-prayer-completion-nudge-dismissed";

function getStoredPrayerTab(slug: string): TabKey {
  if (typeof window === "undefined") {
    return "script";
  }

  const persistedTab = window.localStorage.getItem(`prarthana-prayer-tab:${slug}`);
  if (persistedTab === "script" || persistedTab === "follow" || persistedTab === "meaning" || persistedTab === "about") {
    return persistedTab;
  }
  return "script";
}

function normalizeWord(value: string) {
  return value.toLowerCase().replace(/[।॥,.!?;:()[\]{}"'`]/g, "").trim();
}

function buildVerses(prayer: Prayer): PrayerVerse[] {
  if (prayer.verses?.length) {
    return prayer.verses;
  }

  const script = prayer.content.devanagari || prayer.content.malayalam || prayer.content.english || "";
  const iast = prayer.iast || prayer.transliteration || "";
  const meaning = prayer.meaning || prayer.content.english || "";

  return [
    {
      number: 1,
      script,
      iast,
      meaning,
      audioStartSec: 0
    }
  ];
}

function emphasizeWord(word: string) {
  const match = word.match(/^([^aeiouāīūṛṝḷḹeo]+)?([aeiouāīūṛṝḷḹeo]+)/i);
  if (!match) {
    return <span>{word}</span>;
  }

  const prefix = match[1] || "";
  const stress = match[2] || "";
  const rest = word.slice((prefix + stress).length);

  return (
    <span>
      <strong>
        {prefix}
        {stress}
      </strong>
      {rest}
    </span>
  );
}

function verseGlossaryMatches(verse: PrayerVerse, glossary: PrayerGlossaryEntry[]) {
  const source = `${verse.script || ""} ${verse.iast || ""}`.toLowerCase();
  return glossary.filter((entry) => source.includes(entry.word.toLowerCase())).slice(0, 4);
}

function splitParagraphs(value: string | null | undefined) {
  return String(value || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function rememberCompletionNudgeDismissal() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(COMPLETION_NUDGE_SESSION_KEY, "1");
}

function completionNudgeDismissedForSession() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(COMPLETION_NUDGE_SESSION_KEY) === "1";
}

export function PrayerDetailClient({
  prayer,
  audio,
  isAuthenticated,
  currentTier
}: {
  prayer: Prayer;
  audio?: PrayerAudioMetadata | null;
  isAuthenticated: boolean;
  currentTier: "free" | "bhakt" | "seva";
}) {
  const [tab, setTab] = useState<TabKey>(() => getStoredPrayerTab(prayer.slug));
  const [status, setStatus] = useState("");
  const [showFirstPrayerPrompt, setShowFirstPrayerPrompt] = useState(false);
  const [showCompletionNudge, setShowCompletionNudge] = useState(false);
  const [completionNudgeDismissed, setCompletionNudgeDismissed] = useState(() =>
    completionNudgeDismissedForSession()
  );
  const [activeGlossary, setActiveGlossary] = useState<PrayerGlossaryEntry | null>(null);
  const [completionSent, setCompletionSent] = useState(false);
  const [scriptureReaderSent, setScriptureReaderSent] = useState(false);
  const [wordExplores, setWordExplores] = useState(0);
  const [activeVerseNumber, setActiveVerseNumber] = useState<number | null>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  const uxOpenedSlugRef = useRef<string | null>(null);
  const prayerPaywallTrackedRef = useRef(false);
  const audioSrc = resolvePlayableAudioUrl(
    prayer.audioUrl,
    audio?.directUrl,
    audio?.streamUrl,
    audio?.url
  );
  const { announceGamification, dismissPrompt, markPrayer60s, markPrayerOpened, state } = useUx();
  const { suppressPrompts } = useGuidedFlow();
  const difficulty = getPrayerDifficultyMeta(prayer.difficulty);
  const verses = useMemo(() => buildVerses(prayer), [prayer]);
  const scriptLanguage = prayer.content.malayalam ? "ml" : "sa";
  const requiredTier =
    prayer.requiredTier && prayer.requiredTier !== "free" ? prayer.requiredTier : "bhakt";
  const requiredTierName = requiredTier === "seva" ? "Seva" : "Bhakt";
  const requiredTierPrayerCount = requiredTier === "seva" ? 108 : 54;
  const requiredTierMonthlyPrice = getBillingPriceForTier(requiredTier, "month");
  const requiredTierPriceLabel = requiredTierMonthlyPrice
    ? formatBillingPrice(requiredTierMonthlyPrice)
    : requiredTier === "seva"
      ? "£12.99"
      : "£4.99";
  const prayersRemaining = Math.max(0, 10 - state.prayerOpenCount);
  const prayerLocked = Boolean(prayer.requiredTier && prayer.requiredTier !== "free" && prayer.entitled === false);
  const showPrayerContent = !prayerLocked || suppressPrompts;
  const prayerPaywallDismissed = wasDismissedWithinDays(state.prayerPaywallDismissedAt, 7);
  const completionPromptDismissed = wasDismissedWithinDays(state.prayerCompletionPromptDismissedAt, 7);
  const glossaryMap = useMemo(
    () => new Map((prayer.wordGlossary || []).map((entry) => [normalizeWord(entry.word), entry])),
    [prayer.wordGlossary]
  );
  const pageOpenedAt = useRef(0);
  const minimumReadTimeSeconds = Math.max(10, Math.round((prayer.durationMinutes || 1) * 0.7 * 60));

  useEffect(() => {
    pageOpenedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (prayerLocked) return;
    if (uxOpenedSlugRef.current === prayer.slug) return;
    uxOpenedSlugRef.current = prayer.slug;
    markPrayerOpened(prayer.slug);
    trackEvent("Prayer Opened", {
      prayer_name: prayer.title.en,
      tier: currentTier
    });
  }, [currentTier, markPrayerOpened, prayer.slug, prayer.title.en, prayerLocked]);

  useEffect(() => {
    if (prayerLocked) return;
    const timer = window.setTimeout(() => {
      markPrayer60s(prayer.slug);
      setShowFirstPrayerPrompt(true);
    }, 60000);
    return () => window.clearTimeout(timer);
  }, [markPrayer60s, prayer.slug, prayerLocked]);

  useEffect(() => {
    if (!isAuthenticated || prayerLocked || openedRef.current) return;
    openedRef.current = true;
    void sendJson<GamificationResult>(`/api/backend/prayers/${prayer._id}/open`, {
      method: "POST",
      body: JSON.stringify({})
    })
      .then((result) => announceGamification(result))
      .catch(() => undefined);
  }, [announceGamification, isAuthenticated, prayer._id, prayerLocked]);

  useEffect(() => {
    if (!prayerLocked || prayerPaywallDismissed || prayerPaywallTrackedRef.current || suppressPrompts) {
      return;
    }
    prayerPaywallTrackedRef.current = true;
    trackEvent("Paywall Seen", {
      type: "prayer",
      required_tier: requiredTier,
      prayer_slug: prayer.slug
    });
  }, [prayer.slug, prayerLocked, prayerPaywallDismissed, requiredTier, suppressPrompts]);

  function persistTab(nextTab: TabKey) {
    setTab(nextTab);
    window.localStorage.setItem(`prarthana-prayer-tab:${prayer.slug}`, nextTab);
  }

  function maybeComplete(completedVia: "audio" | "reading") {
    if (!isAuthenticated || completionSent) return;
    setCompletionSent(true);
    void sendJson<GamificationResult>(`/api/backend/prayers/${prayer._id}/complete`, {
      method: "POST",
      body: JSON.stringify({
        durationSeconds: Math.max(
          minimumReadTimeSeconds,
          Math.round((Date.now() - pageOpenedAt.current) / 1000)
        ),
        completedVia
      })
    })
      .then((result) => {
        announceGamification(result);
        if (result.pointsAwarded) {
          setStatus(`Prayer completed. +${result.pointsAwarded} lotus points.`);
        }
        if (
          currentTier === "free" &&
          state.prayerOpenCount >= 7 &&
          !completionPromptDismissed &&
          !completionNudgeDismissedForSession()
        ) {
          setShowCompletionNudge(true);
        }
      })
      .catch((error) => {
        setCompletionSent(false);
        setStatus(error instanceof Error ? error.message : "Unable to record completion.");
      });
  }

  function reportInteraction(kind: "scripture_reader" | "word_explorer", word?: string) {
    if (!isAuthenticated) return;
    void sendJson<GamificationResult>(`/api/backend/prayers/${prayer._id}/interact`, {
      method: "POST",
      body: JSON.stringify({ kind, word, tab })
    })
      .then((result) => announceGamification(result))
      .catch(() => undefined);
  }

  function handleWordTap(rawWord: string) {
    const entry = glossaryMap.get(normalizeWord(rawWord));
    if (!entry) return;

    setActiveGlossary(entry);
    const nextCount = wordExplores + 1;
    setWordExplores(nextCount);
    if (nextCount <= 3) {
      reportInteraction("word_explorer", rawWord);
    }
  }

  function updateActiveVerse(currentTime: number) {
    const sorted = verses
      .filter((entry) => typeof entry.audioStartSec === "number")
      .slice()
      .sort((left, right) => Number(left.audioStartSec || 0) - Number(right.audioStartSec || 0));

    if (!sorted.length) {
      setActiveVerseNumber((current) => (current === null ? current : null));
      return;
    }

    let nextActive = sorted[0].number;
    for (let index = 0; index < sorted.length; index += 1) {
      const current = sorted[index];
      const next = sorted[index + 1];
      const currentStart = Number(current.audioStartSec || 0);
      const nextStart = Number(next?.audioStartSec || Number.POSITIVE_INFINITY);
      if (currentTime >= currentStart && currentTime < nextStart) {
        nextActive = current.number;
        break;
      }
      if (currentTime >= currentStart) {
        nextActive = current.number;
      }
    }

    setActiveVerseNumber((current) => (current === nextActive ? current : nextActive));
  }

  function handlePlaybackChange(isPlaying: boolean) {
    if (!isPlaying) {
      return;
    }

    if (tab !== "follow") {
      persistTab("follow");
    }
  }

  function handleReadingScroll() {
    const element = readingRef.current;
    if (!element) return;

    const reachedBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 12;
    const enoughTime = (Date.now() - pageOpenedAt.current) / 1000 >= minimumReadTimeSeconds;

    if (reachedBottom && tab === "script" && !scriptureReaderSent) {
      setScriptureReaderSent(true);
      reportInteraction("scripture_reader");
    }
    if (reachedBottom && enoughTime) {
      maybeComplete("reading");
    }
  }

  return (
    <div className="prayer-detail-stack">
      {prayerLocked && !suppressPrompts ? (
        <div
          data-testid="prayer-paywall"
          className={cn(
            "surface-card prayer-paywall-card",
            prayerPaywallDismissed && "prayer-paywall-card--compact"
          )}
        >
          {!prayerPaywallDismissed ? (
            <button
              type="button"
              className="discovery-banner__dismiss"
              onClick={() => {
                dismissPrompt("prayerPaywallDismissedAt");
              }}
              aria-label="Dismiss upgrade prompt"
            >
              x
            </button>
          ) : null}
          <div className="prayer-paywall-card__icon" aria-hidden="true">
            OM
          </div>
          <p data-testid="prayer-title" className="muted-label">
            {prayer.title.en}
          </p>
          {!prayerPaywallDismissed ? (
            <>
              <h3>This prayer is part of the {requiredTierName} library</h3>
              <p>
                Your free account includes 10 complete prayers. {requiredTierName} unlocks{" "}
                {requiredTierPrayerCount} guided prayers with bundled audio for{" "}
                {requiredTierPriceLabel}/month.
              </p>
              <div className="card-actions">
                <Button
                  data-testid="prayer-paywall-cta"
                  href={`/plans?highlight=${requiredTier}`}
                  onClick={() =>
                    trackEvent("Upgrade Clicked", {
                      from_tier: currentTier,
                      to_tier: requiredTier,
                      trigger: "paywall_prayer"
                    })
                  }
                >
                  Unlock with {requiredTierName} - {requiredTierPriceLabel}/mo
                </Button>
                <Button tone="ghost" href="/plans">
                  See what&apos;s included in {requiredTierName}
                </Button>
              </div>
              <p className="prayer-paywall-card__footnote">
                Already subscribed? Sign in to a different account or check your plan at /plans.
              </p>
            </>
          ) : (
            <>
              <h3>{requiredTierName} is required to open this prayer.</h3>
              <div className="card-actions">
                <Button
                  tone="ghost"
                  href={`/plans?highlight=${requiredTier}`}
                  onClick={() =>
                    trackEvent("Upgrade Clicked", {
                      from_tier: currentTier,
                      to_tier: requiredTier,
                      trigger: "paywall_prayer_compact"
                    })
                  }
                >
                  View {requiredTierName} plans
                </Button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {showPrayerContent ? (
        <>
      <div className="surface-card shared-prayer-invite">
        <div>
          <p className="eyebrow">Pray together</p>
          <h3>Pray this with your family.</h3>
          <p>Create a shared session and count repetitions together in real time.</p>
        </div>
        <div className="card-actions">
          <Button href={`/sessions/create?prayer=${encodeURIComponent(prayer._id)}`}>
            Start a shared session {"->"}
          </Button>
        </div>
      </div>

      <div className="prayer-detail-meta">
        <span
          className={`difficulty-badge difficulty-badge--${difficulty.tone}`}
          title={difficulty.tooltip}
        >
          🪷 {difficulty.label}
        </span>
        <span className="muted">
          ~{prayer.durationMinutes} minutes · {prayer.verseCount || verses.length} verse(s)
        </span>
      </div>

      <div className="chip-toggle-row chip-toggle-row--tabs">
        {[
          { key: "script", label: "Script" },
          { key: "follow", label: "Follow along" },
          { key: "meaning", label: "Meaning" },
          { key: "about", label: "About" }
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            className={cn("chip-toggle", tab === item.key && "chip-toggle--active")}
            onClick={() => persistTab(item.key as TabKey)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="surface-card prayer-detail-card">
        <div className="prayer-detail-card__top prayer-detail-card__top--stack">
          {audioSrc ? (
            <PrayerAudioPlayer
              key={audioSrc}
              src={audioSrc}
              title={prayer.title.en}
              onProgress={({ currentTime }) => updateActiveVerse(currentTime)}
              onNearComplete={() => maybeComplete("audio")}
              onPlaybackChange={handlePlaybackChange}
            />
          ) : (
            <p className="muted">Audio is coming soon for this prayer.</p>
          )}
          {isAuthenticated ? (
            <Button
              tone="ghost"
              type="button"
              onClick={async () => {
                try {
                  await sendJson(`/api/backend/prayers/${prayer._id}/favorite`, {
                    method: "POST",
                    body: JSON.stringify({})
                  });
                  setStatus("Prayer added to your collection.");
                } catch (error) {
                  setStatus(
                    error instanceof Error ? error.message : "Unable to save favorite."
                  );
                }
              }}
            >
              Save to your prayer collection {"->"}
            </Button>
          ) : (
            <Button tone="ghost" href={`/login?next=${encodeURIComponent(`/prayers/${prayer.slug}`)}`}>
              Save to your prayer collection {"->"}
            </Button>
          )}
        </div>

        {tab === "follow" ? (
          <div className="reading-panel reading-panel--follow">
            <h3>Say it out loud, then sing with the meaning</h3>
            <p className="muted">
              Roman letters stay on top for pronunciation. The English line sits beneath each verse
              so you can follow what you are singing in real time.
            </p>
            <p className="muted">
              Press play and follow the active verse. Read one line, hear one line, then sing the
              next pass with the English meaning in view.
            </p>
          </div>
        ) : null}

        <div
          ref={readingRef}
          key={tab}
          className={cn("reading-panel", `reading-panel--${tab}`)}
          lang={tab === "script" ? scriptLanguage : undefined}
          onScroll={handleReadingScroll}
        >
          {tab === "about" ? (
            <div className="prayer-about">
              <section>
                <h3>The story</h3>
                {splitParagraphs(prayer.plainStory || prayer.meaning).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
              <section>
                <h3>Key words</h3>
                <div className="glossary-table">
                  <div className="glossary-table__head">Word</div>
                  <div className="glossary-table__head">How to say it</div>
                  <div className="glossary-table__head">What it means</div>
                  {(prayer.wordGlossary || []).slice(0, 8).map((entry) => (
                    <div
                      key={`${entry.word}-${entry.transliteration}`}
                      className="glossary-table__row"
                    >
                      <span>{entry.word}</span>
                      <span>{entry.transliteration || "-"}</span>
                      <span>{entry.meaning || "-"}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3>For your family</h3>
                <p>
                  {prayer.familyContext ||
                    "Use this prayer at home in the moments when this deity's qualities are most needed."}
                </p>
                <p>
                  {prayer.nriRelevance ||
                    "This prayer carries temple memory and devotional continuity across timezones."}
                </p>
              </section>
              {String(prayer.difficulty || "").toLowerCase() === "beginner" ? (
                <section>
                  <h3>Good for beginners</h3>
                  <p>{prayer.beginnerTip || prayer.beginnerNote || "This prayer is a gentle place to begin."}</p>
                  <p>
                    This prayer takes {prayer.durationMinutes} minutes and has{" "}
                    {prayer.verseCount || verses.length} verse(s).
                  </p>
                  <p>{prayer.xpReward || 0} lotus points on completion.</p>
                </section>
              ) : null}
            </div>
          ) : (
            verses.map((entry) => {
              const line = tab === "script" ? entry.script : tab === "follow" ? entry.iast : entry.meaning;
              const followLine = entry.iast || entry.script || entry.meaning || "";
              const followMeaning = entry.meaning || prayer.content.english || "";
              const glossaryMatches = verseGlossaryMatches(entry, prayer.wordGlossary || []);

              return (
                <article
                  key={`${entry.number}-${tab}`}
                  className={cn(
                    "verse-block",
                    tab === "follow" && "verse-block--follow",
                    activeVerseNumber === entry.number && "verse-block--active"
                  )}
                >
                  <div className="verse-block__meta">
                    Verse {entry.number}
                    {entry.type ? ` · ${entry.type}` : ""}
                  </div>
                  <div className="verse-block__content">
                    {tab === "follow" ? (
                      <div className="verse-block__follow">
                        {(followLine || "")
                          .split("\n")
                          .filter(Boolean)
                          .map((segment, index) => (
                            <p key={`${entry.number}-follow-${index}`} className="reading-panel__line">
                              {segment
                                .split(/\s+/)
                                .filter(Boolean)
                                .map((word, wordIndex) => {
                                  const match = glossaryMap.get(normalizeWord(word));
                                  const content = emphasizeWord(word);
                                  if (!match) {
                                    return (
                                      <span key={`${word}-${wordIndex}`} className="reading-panel__word">
                                        {content}{" "}
                                      </span>
                                    );
                                  }
                                  return (
                                    <button
                                      key={`${word}-${wordIndex}`}
                                      type="button"
                                      className="word-chip word-chip--inline"
                                      onClick={() => handleWordTap(word)}
                                    >
                                      {content}
                                    </button>
                                  );
                                })}
                            </p>
                          ))}
                        {(followMeaning || "")
                          .split("\n")
                          .filter(Boolean)
                          .map((segment, index) => (
                            <p
                              key={`${entry.number}-meaning-${index}`}
                              className="reading-panel__translation"
                            >
                              {segment}
                            </p>
                          ))}
                      </div>
                    ) : (
                      (line || "")
                        .split("\n")
                        .filter(Boolean)
                        .map((segment, index) => (
                          <p key={`${entry.number}-${index}`} className="reading-panel__line">
                            {segment
                              .split(/\s+/)
                              .filter(Boolean)
                              .map((word, wordIndex) => {
                                const match = glossaryMap.get(normalizeWord(word));
                                if (!match || tab === "meaning") {
                                  return <span key={`${word}-${wordIndex}`}>{word} </span>;
                                }
                                return (
                                  <button
                                    key={`${word}-${wordIndex}`}
                                    type="button"
                                    className="word-chip"
                                    onClick={() => handleWordTap(word)}
                                  >
                                    {word}
                                  </button>
                                );
                              })}
                          </p>
                        ))
                    )}
                  </div>
                  {tab === "meaning" && glossaryMatches.length ? (
                    <div className="verse-block__gloss">
                      {glossaryMatches.map((entryGloss) => (
                        <span key={`${entry.number}-${entryGloss.word}`} className="word-pill">
                          {entryGloss.word}: {entryGloss.meaning}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>

        {activeGlossary ? (
          <div className="glossary-tooltip" role="note">
            <strong>{activeGlossary.word}</strong> ·{" "}
            {activeGlossary.transliteration || activeGlossary.word} ·{" "}
            {activeGlossary.meaning || "Pronunciation guidance"}
            <button
              type="button"
              className="glossary-tooltip__dismiss"
              onClick={() => setActiveGlossary(null)}
              aria-label="Close glossary note"
            >
              ×
            </button>
          </div>
        ) : null}

        {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
      </div>

      {showFirstPrayerPrompt && state.firstPrayer60sAt ? (
        <div className="discovery-banner discovery-banner--gold">
          <strong>You opened your first prayer.</strong>
          <p>Next: save this prayer to your collection, or explore a puja at the temple.</p>
          <div className="card-actions">
            {isAuthenticated ? (
              <Button
                tone="secondary"
                type="button"
                onClick={async () => {
                  try {
                    await sendJson(`/api/backend/prayers/${prayer._id}/favorite`, {
                      method: "POST",
                      body: JSON.stringify({})
                    });
                    setStatus("Prayer added to your collection.");
                  } catch (error) {
                    setStatus(
                      error instanceof Error ? error.message : "Unable to save favorite."
                    );
                  }
                }}
              >
                Save prayer
              </Button>
            ) : (
              <Button tone="secondary" href={`/login?next=${encodeURIComponent(`/prayers/${prayer.slug}`)}`}>
                Sign in to save this prayer
              </Button>
            )}
            <Button tone="ghost" href="/pujas">
              Browse pujas
            </Button>
          </div>
        </div>
      ) : null}

      {prayer.deity?.slug ? (
        <div className="discovery-banner discovery-banner--patina">
          <strong>Want to understand {prayer.title.en} more deeply?</strong>
          <p>
            The {prayer.deity.name.en} learning path explains the mythology, symbolism, and home
            context around this prayer in short modules.
          </p>
          <div className="card-actions">
            <Button tone="secondary" href={`/deities/${prayer.deity.slug}/learn`}>
              Open the {prayer.deity.name.en} learning path {"->"}
            </Button>
          </div>
        </div>
      ) : null}
        </>
      ) : null}

      {showCompletionNudge &&
      !suppressPrompts &&
      currentTier === "free" &&
      isAuthenticated &&
      state.prayerOpenCount >= 7 &&
      !completionPromptDismissed &&
      !completionNudgeDismissed ? (
        <div data-testid="prayer-completion-nudge" className="prayer-completion-nudge" role="status" aria-live="polite">
          <button
            type="button"
            data-testid="nudge-dismiss"
            className="discovery-banner__dismiss"
            onClick={() => {
              setShowCompletionNudge(false);
              setCompletionNudgeDismissed(true);
              rememberCompletionNudgeDismissal();
              dismissPrompt("prayerCompletionPromptDismissedAt");
            }}
            aria-label="Dismiss prayer upgrade reminder"
          >
            x
          </button>
          <span>
            You have {prayersRemaining} prayer{prayersRemaining === 1 ? "" : "s"} remaining on your free account.
            Bhakt unlocks 54.
          </span>
          <a
            href="/plans?highlight=bhakt"
            className="inline-link"
            onClick={() =>
              trackEvent("Upgrade Clicked", {
                from_tier: currentTier,
                to_tier: "bhakt",
                trigger: "prayer_completion_nudge"
              })
            }
          >
            Upgrade {"->"}
          </a>
        </div>
      ) : null}
    </div>
  );
}
