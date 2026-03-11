"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "@/lib/client-api";
import { Button } from "@/components/ui/Button";
import { StatusStrip } from "@/components/ui/StatusStrip";
import type { Prayer, SharedPrayerSession } from "@/lib/types";

export function SharedPrayerCreateForm({ prayers }: { prayers: Prayer[] }) {
  const router = useRouter();
  const [selectedPrayer, setSelectedPrayer] = useState("");
  const [repetitions, setRepetitions] = useState("21");
  const [status, setStatus] = useState("");

  return (
    <div className="surface-card">
      <div className="form-grid">
        <label className="field">
          <span>Prayer</span>
          <select value={selectedPrayer} onChange={(event) => setSelectedPrayer(event.target.value)}>
            <option value="">Select prayer</option>
            {prayers.map((prayer) => (
              <option key={prayer._id} value={prayer._id}>
                {prayer.title.en}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Repetitions</span>
          <select value={repetitions} onChange={(event) => setRepetitions(event.target.value)}>
            {[1, 3, 7, 11, 21, 51, 108].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>
      </div>
      {status ? <StatusStrip tone="warning">{status}</StatusStrip> : null}
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
                  totalRepetitions: Number(repetitions)
                })
              });
              router.push(`/shared-prayer/${session.sessionCode}`);
            } catch (error) {
              setStatus(error instanceof Error ? error.message : "Unable to create session.");
            }
          }}
        >
          Create session
        </Button>
      </div>
    </div>
  );
}
