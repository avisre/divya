"use client";

import { useState } from "react";
import { sendJson } from "../../lib/client-api";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";
import type { Prayer, PrayerAudioMetadata } from "../../lib/types";

export function PrayerDetailClient({
  prayer,
  audio,
  isAuthenticated
}: {
  prayer: Prayer;
  audio?: PrayerAudioMetadata | null;
  isAuthenticated: boolean;
}) {
  const [tab, setTab] = useState<"script" | "iast" | "meaning">("script");
  const [status, setStatus] = useState("");
  const audioSrc = audio?.streamUrl || audio?.url || prayer.audioUrl || "";

  return (
    <div className="prayer-detail-stack">
      <div className="chip-toggle-row">
        <button
          type="button"
          className={`chip-toggle ${tab === "script" ? "chip-toggle--active" : ""}`}
          onClick={() => setTab("script")}
        >
          Script
        </button>
        <button
          type="button"
          className={`chip-toggle ${tab === "iast" ? "chip-toggle--active" : ""}`}
          onClick={() => setTab("iast")}
        >
          IAST
        </button>
        <button
          type="button"
          className={`chip-toggle ${tab === "meaning" ? "chip-toggle--active" : ""}`}
          onClick={() => setTab("meaning")}
        >
          Meaning
        </button>
      </div>
      <div className="surface-card">
        <div className="card-actions">
          {audioSrc ? <audio controls preload="none" src={audioSrc} className="audio-player" /> : <p>Audio is coming soon for this prayer.</p>}
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
                    setStatus("Prayer added to favorites.");
                  } catch (error) {
                    setStatus(error instanceof Error ? error.message : "Unable to save favorite.");
                  }
                }}
              >
                Save prayer
              </Button>
            ) : (
              <Button tone="secondary" href={`/login?next=${encodeURIComponent(`/prayers/${prayer.slug}`)}`}>
                Sign in to save
              </Button>
            )}
          </div>
        </div>
        <div className="reading-panel">
          {tab === "script" ? prayer.content.devanagari || prayer.content.malayalam || prayer.content.english : null}
          {tab === "iast" ? prayer.iast || prayer.transliteration || "IAST guidance will appear here." : null}
          {tab === "meaning" ? prayer.meaning || prayer.content.english || "Meaning is not available yet." : null}
        </div>
        {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
      </div>
    </div>
  );
}
