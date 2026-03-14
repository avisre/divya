"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { sendJson } from "../../lib/client-api";
import { getDeityThemeStyle } from "../../lib/presentation";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";
import { useUx } from "../ux/UxProvider";
import type { Prayer, SharedPrayerSession } from "../../lib/types";

const repetitionChoices = [
  { count: 21, note: "Traditional daily count" },
  { count: 108, note: "Full mala, most auspicious" },
  { count: 1008, note: "Mahayajna count" }
];

export function SharedPrayerCreateForm({ prayers }: { prayers: Prayer[] }) {
  const searchParams = useSearchParams();
  const requestedPrayer = searchParams.get("prayer") || "";
  const [selectedPrayer, setSelectedPrayer] = useState(requestedPrayer);
  const [repetitions, setRepetitions] = useState(21);
  const [expectedOthers, setExpectedOthers] = useState(0);
  const [status, setStatus] = useState("");
  const [createdSession, setCreatedSession] = useState<SharedPrayerSession | null>(null);
  const [copied, setCopied] = useState(false);
  const { markSharedPrayerCreated } = useUx();

  const selectedPrayerRecord = prayers.find((prayer) => prayer._id === selectedPrayer) || null;

  async function copyCode() {
    if (!createdSession) return;
    await navigator.clipboard.writeText(createdSession.sessionCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const whatsappHref = createdSession
    ? `https://wa.me/?text=${encodeURIComponent(
        `I'm starting a shared prayer session for ${selectedPrayerRecord?.title.en || "a prayer"} on Prarthana.\nJoin me: open Prarthana, go to Shared Prayer, and enter code ${createdSession.sessionCode}.\nLet's count ${repetitions} repetitions together.`
      )}`
    : "";

  return (
    <div className="surface-card shared-prayer-create">
      <div className="shared-prayer-create__catalog">
        {prayers.slice(0, 9).map((prayer) => (
          <button
            key={prayer._id}
            type="button"
            className={`selection-card ${selectedPrayer === prayer._id ? "selection-card--active" : ""}`}
            style={getDeityThemeStyle(prayer.deity?.name?.en || prayer.title.en)}
            onClick={() => setSelectedPrayer(prayer._id)}
          >
            <span className="selection-card__eyebrow">{prayer.type}</span>
            <strong>{prayer.title.en}</strong>
            <span>{prayer.deity?.name?.en || "Temple prayer"}</span>
          </button>
        ))}
      </div>

      <div className="repetition-choice-row">
        {repetitionChoices.map((choice) => (
          <button
            key={choice.count}
            type="button"
            className={`repetition-chip ${repetitions === choice.count ? "repetition-chip--active" : ""}`}
            onClick={() => setRepetitions(choice.count)}
          >
            <strong>{choice.count}</strong>
            <span>{choice.note}</span>
          </button>
        ))}
      </div>

      <div className="surface-card shared-prayer-create__expectation">
        <p className="eyebrow">Participant expectation</p>
        <h3>You + how many others?</h3>
        <div className="catalog-filter-row">
          {[0, 1, 2, 4].map((count) => (
            <button
              key={count}
              type="button"
              className={`filter-pill ${expectedOthers === count ? "filter-pill--active" : ""}`}
              onClick={() => setExpectedOthers(count)}
            >
              {count === 0 ? "Just me" : `${count} others`}
            </button>
          ))}
        </div>
        <p className="muted">This helps the lobby communicate clearly when you are waiting for family to join.</p>
      </div>

      {createdSession ? (
        <div className="session-code-panel">
          <p className="eyebrow">Share with family</p>
          <div className="session-code-panel__code">{createdSession.sessionCode}</div>
          <p className="muted">
            Share the code with family so they can join the same sacred room from abroad.
          </p>
          <div className="card-actions">
            <Button type="button" onClick={copyCode}>
              Copy & share with family
            </Button>
            {copied ? <span className="session-code-panel__tooltip">Copied!</span> : null}
            <Button tone="secondary" href={whatsappHref}>
              Share via WhatsApp
            </Button>
            <Button tone="secondary" href={`/sessions/${createdSession.sessionCode}?expected=${expectedOthers}`}>
              Open prayer room
            </Button>
          </div>
        </div>
      ) : null}

      {selectedPrayerRecord ? (
        <div className="selected-prayer-note">
          <span className="eyebrow">Selected prayer</span>
          <strong>{selectedPrayerRecord.title.en}</strong>
          <span>{selectedPrayerRecord.deity?.name?.en || "Shared family prayer"}</span>
        </div>
      ) : null}

      {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}

      <div className="card-actions">
        <Button
          type="button"
          onClick={async () => {
            if (!selectedPrayer) {
              setStatus("Choose a prayer first.");
              return;
            }
            try {
              const session = await sendJson<SharedPrayerSession>("/api/backend/prayer-sessions", {
                method: "POST",
                body: JSON.stringify({
                  prayerId: selectedPrayer,
                  totalRepetitions: repetitions
                })
              });
              setCreatedSession(session);
              setStatus("Family prayer room created.");
              markSharedPrayerCreated();
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "Unable to create session.");
            }
          }}
        >
          Create prayer room
        </Button>
      </div>
    </div>
  );
}
