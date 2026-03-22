"use client";

import { useState } from "react";
import { useGuidedFlow } from "./GuidedFlowProvider";

function isRecentExit(exitedAt: string | null) {
  if (!exitedAt) return false;
  const timestamp = new Date(exitedAt).getTime();
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp <= 14 * 24 * 60 * 60 * 1000;
}

export function GuidedFlowResumeBanner() {
  const { guidedFlow, hasResumeLink, resumeGuidedFlow, resumeStep } = useGuidedFlow();
  const [dismissed, setDismissed] = useState(false);

  if (!hasResumeLink || dismissed || !isRecentExit(guidedFlow.exitedAt)) {
    return null;
  }

  return (
    <div className="guided-flow-resume-banner">
      <span>You left your introduction at step {resumeStep}.</span>
      <button
        type="button"
        className="inline-link guided-flow-resume-banner__link"
        onClick={() => {
          void resumeGuidedFlow();
        }}
      >
        Continue {"->"}
      </button>
      <button
        type="button"
        className="guided-flow-resume-banner__dismiss"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss introduction reminder"
      >
        x
      </button>
    </div>
  );
}
