"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sendJson } from "../../lib/client-api";
import { cn } from "../../lib/cn";
import { getPrayerDifficultyMeta } from "../../lib/presentation";
import type {
  GamificationResult,
  Prayer,
  PrayerAudioMetadata,
  PrayerGlossaryEntry,
  PrayerVerse
} from "../../lib/types";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";
import { PrayerAudioPlayer } from "./PrayerAudioPlayer";
import { useUx } from "../ux/UxProvider";

type TabKey = "script" | "follow" | "meaning" | "about";

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

export function PrayerDetailClient({
  prayer,
  audio,
  isAuthenticated
}: {
  prayer: Prayer;
  audio?: PrayerAudioMetadata | null;
  isAuthenticated: boolean;
}) {
  const [tab, setTab] = useState<TabKey>(() => getStoredPrayerTab(prayer.slug));
  const [status, setStatus] = useState("");
  const [showFirstPrayerPrompt, setShowFirstPrayerPrompt] = useState(false);
  const [activeGlossary, setActiveGlossary] = useState<PrayerGlossaryEntry | null>(null);
  const [completionSent, setCompletionSent] = useState(false);
  const [scriptureReaderSent, setScriptureReaderSent] = useState(false);
  const [wordExplores, setWordExplores] = useState(0);
  const [activeVerseNumber, setActiveVerseNumber] = useState<number | null>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const openedRef = useRef(false);
  const audioSrc = audio?.streamUrl || audio?.url || prayer.audioUrl || "";
  const { announceGamification, markPrayer60s, markPrayerOpened, state } = useUx();
  const difficulty = getPrayerDifficultyMeta(prayer.difficulty);
  const verses = useMemo(() => buildVerses(prayer), [prayer]);
  const scriptLanguage = prayer.content.malayalam ? "ml" : "sa";
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
    markPrayerOpened(prayer.slug);
  }, [markPrayerOpened, prayer.slug]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      markPrayer60s(prayer.slug);
      setShowFirstPrayerPrompt(true);
    }, 60000);
    return () => window.clearTimeout(timer);
  }, [markPrayer60s, prayer.slug]);

  useEffect(() => {
    if (!isAuthenticated || openedRef.current) return;
    openedRef.current = true;
    void sendJson<GamificationResult>(`/api/backend/prayers/${prayer._id}/open`, {
      method: "POST",
      body: JSON.stringify({})
    })
      .then((result) => announceGamification(result))
      .catch(() => undefined);
  }, [announceGamification, isAuthenticated, prayer._id]);

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
      setActiveVerseNumber(null);
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

    setActiveVerseNumber(nextActive);
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
            <h3>Say it out loud</h3>
            <p className="muted">
              Roman letters so you can follow the pronunciation without knowing any Indian script.
            </p>
            <p className="muted">
              Tip: read each word slowly once, then try saying it with the audio. Your pronunciation
              will improve naturally within 5 sessions.
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
              const glossaryMatches = verseGlossaryMatches(entry, prayer.wordGlossary || []);

              return (
                <article
                  key={`${entry.number}-${tab}`}
                  className={cn("verse-block", activeVerseNumber === entry.number && "verse-block--active")}
                >
                  <div className="verse-block__meta">
                    Verse {entry.number}
                    {entry.type ? ` · ${entry.type}` : ""}
                  </div>
                  <div className="verse-block__content">
                    {(line || "")
                      .split("\n")
                      .filter(Boolean)
                      .map((segment, index) => (
                        <p key={`${entry.number}-${index}`} className="reading-panel__line">
                          {tab === "follow"
                            ? segment
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
                                })
                            : segment
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
                      ))}
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
    </div>
  );
}
