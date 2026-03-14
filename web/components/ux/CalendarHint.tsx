"use client";

import { Button } from "../ui/Button";
import { useUx } from "./UxProvider";

export function CalendarHint({ isToday }: { isToday: boolean }) {
  const { state, dismissPrompt } = useUx();

  return (
    <div className="calendar-day__actions">
      <Button tone="secondary" href="/prayers">
        Browse prayers
      </Button>
      {isToday && !state.firstCalendarHintDismissedAt ? (
        <div className="calendar-hint-card">
          <p>
            Prayers are filtered by today&apos;s tithi context. Auspicious days surface
            prosperity prayers. Amavasya days surface ancestor prayers.
          </p>
          <button
            type="button"
            className="text-button"
            onClick={() => dismissPrompt("firstCalendarHintDismissedAt")}
          >
            Got it
          </button>
        </div>
      ) : null}
    </div>
  );
}
