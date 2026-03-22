"use client";

export type UxFeatureKey = "shared_prayer" | "gift_puja" | "learning_path" | "sacred_video";

export type UxState = {
  showWelcomeOverlay: boolean;
  welcomeSeenAt?: string;
  onboardingStartedAt?: string;
  onboardingSkippedAt?: string;
  onboardingSelection?: "pray" | "book" | "together" | "learn";
  onboardingCountry?: string;
  onboardingTimezone?: string;
  onboardingDeitySlugs?: string[];
  firstPrayerBannerDismissedAt?: string;
  firstPrayerSlug?: string;
  prayerOpenCount: number;
  firstPrayerOpenedAt?: string;
  firstPrayer60sAt?: string;
  visitedPujas: boolean;
  onboardingCompletedAt?: string;
  onboardingCompletedBannerDismissedAt?: string;
  firstHomeSharedIntroDismissedAt?: string;
  firstCalendarHintDismissedAt?: string;
  learningPromptDismissedAt?: string;
  videoPromptDismissedAt?: string;
  giftPromptDismissedAt?: string;
  prayerPaywallDismissedAt?: string;
  waitlistPaywallDismissedAt?: string;
  sacredVideoPaywallDismissedAt?: string;
  prayerCompletionPromptDismissedAt?: string;
  sharedPrayerCreatedAt?: string;
  learningPathOpenedAt?: string;
  giftStartedAt?: string;
  giftCompletedAt?: string;
  videoWatchedAt?: string;
};

export const defaultUxState: UxState = {
  showWelcomeOverlay: false,
  prayerOpenCount: 0,
  visitedPujas: false
};

const UX_PREFIX = "divya-web-ux-v1";
const PENDING_ONBOARDING_KEY = "divya-web-pending-onboarding";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getUxStorageKey(userId: string) {
  return `${UX_PREFIX}:${userId}`;
}

export function readUxState(userId: string): UxState {
  if (!isBrowser()) return defaultUxState;
  try {
    const raw = window.localStorage.getItem(getUxStorageKey(userId));
    if (!raw) return defaultUxState;
    return {
      ...defaultUxState,
      ...(JSON.parse(raw) as Partial<UxState>)
    };
  } catch {
    return defaultUxState;
  }
}

export function writeUxState(userId: string, state: UxState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(getUxStorageKey(userId), JSON.stringify(state));
}

export function markPendingOnboarding() {
  if (!isBrowser()) return;
  window.localStorage.setItem(PENDING_ONBOARDING_KEY, new Date().toISOString());
}

export function consumePendingOnboarding() {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(PENDING_ONBOARDING_KEY);
  if (!raw) return null;
  window.localStorage.removeItem(PENDING_ONBOARDING_KEY);
  return raw;
}

export function wasDismissedWithinDays(value: string | undefined, days: number) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;
  return Date.now() - timestamp < days * 24 * 60 * 60 * 1000;
}
