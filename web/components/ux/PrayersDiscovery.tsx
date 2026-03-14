"use client";

import { Button } from "../ui/Button";
import { useUx } from "./UxProvider";

export function PrayersDiscovery({
  gayatriSlug,
  learningPathHref,
  learningPathName
}: {
  gayatriSlug?: string;
  learningPathHref: string;
  learningPathName: string;
}) {
  const { state, dismissFirstPrayerBanner, dismissPrompt } = useUx();

  return (
    <div className="page-stack">
      {state.onboardingStartedAt &&
      !state.firstPrayerSlug &&
      !state.firstPrayerBannerDismissedAt ? (
        <div className="discovery-banner discovery-banner--vermilion">
          <strong>Your first prayer {"->"}</strong>
          <p>
            Start with the Gayatri Mantra - 3 minutes, audio guidance, English meaning
            included. It is one of the most widely recited morning prayers across traditions.
          </p>
          <div className="card-actions">
            <Button tone="secondary" href={gayatriSlug ? `/prayers/${gayatriSlug}` : "/prayers"}>
              Open Gayatri Mantra
            </Button>
            <button type="button" className="text-button" onClick={dismissFirstPrayerBanner}>
              {"I\u2019ll choose myself"}
            </button>
          </div>
        </div>
      ) : null}

      {state.prayerOpenCount >= 3 && !state.learningPromptDismissedAt ? (
        <div className="discovery-banner discovery-banner--patina">
          <strong>You have opened {state.prayerOpenCount} prayers. Ready to go deeper?</strong>
          <p>
            The Journey with {learningPathName} learning path pairs prayers with stories, symbolism,
            and home ritual guidance in the right order.
          </p>
          <div className="card-actions">
            <Button tone="secondary" href={learningPathHref}>
              Open learning path {"->"}
            </Button>
            <button
              type="button"
              className="text-button"
              onClick={() => dismissPrompt("learningPromptDismissedAt")}
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
