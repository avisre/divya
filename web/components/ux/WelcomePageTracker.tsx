"use client";

import { useEffect } from "react";
import { sendJson } from "../../lib/client-api";
import { trackEvent } from "../../lib/analytics";
import { readUxState, writeUxState } from "../../lib/ux-state";

export function WelcomePageTracker({ userId }: { userId: string }) {
  useEffect(() => {
    const current = readUxState(userId);
    if (current.welcomeSeenAt) {
      return;
    }

    const welcomeSeenAt = new Date().toISOString();
    writeUxState(userId, {
      ...current,
      welcomeSeenAt
    });
    trackEvent("Welcome Seen", { surface: "post_signup" });
    void sendJson("/api/backend/users/profile", {
      method: "PUT",
      body: JSON.stringify({ welcomeSeenAt })
    }).catch(() => undefined);
  }, [userId]);

  return null;
}
