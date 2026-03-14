"use client";

import { useState } from "react";
import { sendJson } from "../../lib/client-api";
import { StatusStrip } from "../ui/StatusStrip";
import type { UserSession } from "../../lib/types";

export function VideoNotificationToggle({ user }: { user: UserSession }) {
  const [enabled, setEnabled] = useState(Boolean(user.prayerReminders?.festivalAlerts));
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");

  return (
    <div className="video-notification-toggle">
      <label className="catalog-checkbox">
        <input
          type="checkbox"
          checked={enabled}
          disabled={pending}
          onChange={async (event) => {
            const nextValue = event.target.checked;
            setEnabled(nextValue);
            setPending(true);
            setStatus("");
            try {
              await sendJson("/api/backend/users/profile", {
                method: "PUT",
                body: JSON.stringify({
                  preferredLanguage: user.preferredLanguage || "english",
                  country: user.country || "US",
                  timezone: user.timezone || "Asia/Kolkata",
                  prayerReminders: {
                    ...(user.prayerReminders || {}),
                    festivalAlerts: nextValue
                  }
                })
              });
              setStatus(nextValue ? "Email notification is on." : "Email notification is off.");
            } catch (error) {
              setEnabled(!nextValue);
              setStatus(error instanceof Error ? error.message : "Unable to update notification preference.");
            } finally {
              setPending(false);
            }
          }}
        />
        <span>Get notified by email when the recording is ready.</span>
      </label>
      {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
    </div>
  );
}
