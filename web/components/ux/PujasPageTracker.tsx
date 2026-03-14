"use client";

import { useEffect } from "react";
import { trackEvent } from "../../lib/analytics";
import { useUx } from "./UxProvider";

export function PujasPageTracker() {
  const { markVisitedPujas } = useUx();

  useEffect(() => {
    markVisitedPujas();
    trackEvent("puja_trust_bar_impression");
  }, [markVisitedPujas]);

  return null;
}
