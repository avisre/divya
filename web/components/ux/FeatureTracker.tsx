"use client";

import { useEffect } from "react";
import { useUx } from "./UxProvider";

export function FeatureTracker({
  feature,
  deityId
}: {
  feature: "learning" | "video";
  deityId?: string;
  bookingId?: string;
}) {
  const { markLearningPathOpened } = useUx();

  useEffect(() => {
    if (feature === "learning" && deityId) {
      markLearningPathOpened(deityId);
    }
  }, [deityId, feature, markLearningPathOpened]);

  return null;
}
