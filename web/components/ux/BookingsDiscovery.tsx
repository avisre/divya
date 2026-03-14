"use client";

import type { PujaBooking } from "../../lib/types";
import { Button } from "../ui/Button";
import { useUx } from "./UxProvider";

export function BookingsDiscovery({ bookings }: { bookings: PujaBooking[] }) {
  const { state, dismissPrompt } = useUx();
  const latestBooking = bookings[0] || null;

  return (
    <div className="page-stack">
      {latestBooking && !state.videoPromptDismissedAt ? (
        <div className="discovery-banner discovery-banner--gold">
          <strong>Your recording is coming.</strong>
          <p>
            Within 48 hours of your puja being performed, a private HD video will appear
            in this booking. You will receive an email notification when it is ready.
          </p>
          <div className="card-actions">
            <button
              type="button"
              className="text-button"
              onClick={() => dismissPrompt("videoPromptDismissedAt")}
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}

      {latestBooking && !state.giftPromptDismissedAt ? (
        <div className="discovery-banner discovery-banner--vermilion">
          <strong>Know someone who would value this?</strong>
          <p>
            You can book any puja as a gift for a family member. They&apos;ll receive the
            recording, and the Tantri performs in their name.
          </p>
          <div className="card-actions">
            <Button tone="secondary" href="/pujas">
              Browse pujas to gift →
            </Button>
            <button
              type="button"
              className="text-button"
              onClick={() => dismissPrompt("giftPromptDismissedAt")}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
