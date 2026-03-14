import type { GamificationMilestone, GamificationTier, Stats } from "./types";

export const milestoneDefinitions: Array<{
  key: string;
  label: string;
  icon: string;
  requirement: string;
}> = [
  { key: "FIRST_STEP", label: "First step", icon: "🌱", requirement: "Open your first prayer." },
  { key: "FAMILY_BOND", label: "Family bond", icon: "👨‍👩‍👧", requirement: "Complete your first shared prayer session." },
  { key: "SEVEN_DAY_RHYTHM", label: "7-day rhythm", icon: "🗓", requirement: "Pray on 7 different days this month." },
  { key: "SCRIPTURE_READER", label: "Scripture reader", icon: "📚", requirement: "Scroll to the end of the Script tab on any prayer." },
  { key: "WORD_EXPLORER", label: "Word explorer", icon: "🔎", requirement: "Tap 3 prayer words to explore their meaning." },
  { key: "FIRST_BOOKING", label: "First booking", icon: "🏛️", requirement: "Complete your first puja booking." },
  { key: "LEARNING_COMPLETE", label: "Learning complete", icon: "🪷", requirement: "Finish all modules in one learning path." },
  { key: "FAMILY_TEACHER", label: "Family teacher", icon: "💛", requirement: "Start your first shared prayer room." },
  { key: "DEEP_PRACTICE", label: "Deep practice", icon: "🔱", requirement: "Complete the same prayer 5 times." },
  { key: "HUNDRED_LOTUS", label: "Hundred lotus", icon: "✨", requirement: "Reach 100 lotus points." }
];

export function getContinuePracticeHref(stats: Stats | null | undefined, fallbackHref: string) {
  if (stats?.lastOpenedPrayerSlug) {
    return `/prayers/${stats.lastOpenedPrayerSlug}`;
  }
  return fallbackHref;
}

export function getEarnedMilestoneMap(milestones: GamificationMilestone[] | undefined) {
  return new Map((milestones || []).map((milestone) => [milestone.key, milestone]));
}

export function isTierUpgrade(previousTier?: Partial<GamificationTier> | null, currentTier?: Partial<GamificationTier> | null) {
  return Boolean(previousTier?.key && currentTier?.key && previousTier.key !== currentTier.key);
}
