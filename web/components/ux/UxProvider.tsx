"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode
} from "react";
import { trackEvent } from "../../lib/analytics";
import type { GamificationMilestone, GamificationResult } from "../../lib/types";
import {
  consumePendingOnboarding,
  defaultUxState,
  readUxState,
  writeUxState,
  type UxFeatureKey,
  type UxState
} from "../../lib/ux-state";
import type { UserSession } from "../../lib/types";

type PromptKey =
  | "firstPrayerBannerDismissedAt"
  | "onboardingCompletedBannerDismissedAt"
  | "firstHomeSharedIntroDismissedAt"
  | "firstCalendarHintDismissedAt"
  | "learningPromptDismissedAt"
  | "videoPromptDismissedAt"
  | "giftPromptDismissedAt";

type UxContextValue = {
  state: UxState;
  ready: boolean;
  showWelcomeOverlay: boolean;
  showSetupCompleteBanner: boolean;
  completeOnboarding: (details?: {
    selection?: "pray" | "book" | "together" | "learn";
    country?: string;
    timezone?: string;
    deitySlugs?: string[];
  }) => void;
  skipOnboarding: () => void;
  markPrayerOpened: (slug: string) => void;
  markPrayer60s: (slug: string) => void;
  markVisitedPujas: () => void;
  dismissPrompt: (key: PromptKey) => void;
  dismissFirstPrayerBanner: () => void;
  markSharedPrayerCreated: () => void;
  markLearningPathOpened: (deityId: string) => void;
  markGiftStarted: () => void;
  markGiftCompleted: () => void;
  markVideoWatched: (bookingId?: string) => void;
  markFeatureUsed: (feature: UxFeatureKey) => void;
  announceGamification: (result: GamificationResult | null | undefined) => void;
};

const UxContext = createContext<UxContextValue | null>(null);

type UxStore = {
  ready: boolean;
  state: UxState;
};

type UxAction =
  | { type: "reset" }
  | { type: "hydrate"; state: UxState }
  | { type: "patch"; patch: Partial<UxState> }
  | { type: "update"; updater: (current: UxState) => UxState };

function nowIso() {
  return new Date().toISOString();
}

function finalizeUxState(nextState: UxState) {
  if (!nextState.onboardingCompletedAt && nextState.prayerOpenCount > 0 && nextState.visitedPujas) {
    return {
      ...nextState,
      onboardingCompletedAt: nowIso()
    };
  }

  return nextState;
}

function applyUxPatch(current: UxState, patch: Partial<UxState>) {
  return finalizeUxState({
    ...current,
    ...patch
  });
}

function getNextState(current: UxState, patch: Partial<UxState>) {
  return applyUxPatch(current, patch);
}

function uxReducer(store: UxStore, action: UxAction): UxStore {
  switch (action.type) {
    case "reset":
      return {
        ready: true,
        state: defaultUxState
      };
    case "hydrate":
      return {
        ready: true,
        state: applyUxPatch(defaultUxState, action.state)
      };
    case "patch":
      return {
        ...store,
        state: applyUxPatch(store.state, action.patch)
      };
    case "update":
      return {
        ...store,
        state: finalizeUxState(action.updater(store.state))
      };
    default:
      return store;
  }
}

function WelcomeOverlay({
  firstName,
  onClose,
  onSelect
}: {
  firstName: string;
  onClose: (skipped: boolean) => void;
  onSelect: (selection: "pray" | "book" | "together" | "learn") => void;
}) {
  const [skipEnabled, setSkipEnabled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSkipEnabled(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-label="Welcome to Prarthana">
      <div className="welcome-overlay__card">
        <div className="welcome-overlay__badge">{"\u0950"}</div>
        <p className="eyebrow">Welcome</p>
        <h2>Namaste, {firstName}.</h2>
        <p className="welcome-overlay__copy">
          Prarthana connects your family to Bhadra Bhagavathi Temple in Karunagapally.
          Here is what you can do here.
        </p>
        <div className="welcome-grid">
          {[
            {
              key: "pray",
              icon: "Hands",
              title: "Pray daily",
              body: "Script, audio, and meaning for 20+ sacred prayers"
            },
            {
              key: "book",
              icon: "Temple",
              title: "Book a puja",
              body: "The Tantri performs in your name. Video delivered."
            },
            {
              key: "together",
              icon: "Family",
              title: "Pray together",
              body: "Shared sessions so your family counts together"
            },
            {
              key: "learn",
              icon: "Book",
              title: "Learn and explore",
              body: "Deity learning paths for you and your children"
            }
          ].map((tile) => (
            <button
              key={tile.key}
              type="button"
              className="welcome-tile"
              onClick={() => onSelect(tile.key as "pray" | "book" | "together" | "learn")}
            >
              <span className="welcome-tile__icon">{tile.icon}</span>
              <strong>{tile.title}</strong>
              <span>{tile.body}</span>
            </button>
          ))}
        </div>
        <div className="welcome-overlay__actions">
          <button type="button" className="button button--primary button--block" onClick={() => onSelect("pray")}>
            Begin with a prayer {"->"}
          </button>
          <button type="button" className="welcome-overlay__skip-link" onClick={() => onClose(false)}>
            Skip and explore on your own
          </button>
        </div>
        {skipEnabled ? (
          <button
            type="button"
            className="welcome-overlay__skip-corner"
            onClick={() => onClose(true)}
          >
            Skip setup
          </button>
        ) : null}
      </div>
    </div>
  );
}

type ToastNotice = GamificationMilestone & {
  id: string;
};

function playSoftBell() {
  if (typeof window === "undefined") return;
  if ("matchMedia" in window && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  try {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 528;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignore browser audio restrictions.
  }
}

function MilestoneToast({
  toast,
  onDismiss
}: {
  toast: ToastNotice;
  onDismiss: () => void;
}) {
  return (
    <div className="lotus-toast" role="status" aria-live="polite">
      <div className="lotus-toast__icon" aria-hidden="true">
        🪷
      </div>
      <div className="lotus-toast__content">
        <div className="lotus-toast__title">{toast.name}</div>
        <div className="lotus-toast__message">{toast.toast}</div>
        {toast.pointsBonus ? <div className="lotus-toast__points">+{toast.pointsBonus} lotus points</div> : null}
      </div>
      <button type="button" className="lotus-toast__dismiss" onClick={onDismiss} aria-label="Dismiss milestone">
        ×
      </button>
    </div>
  );
}

function TierUpgradeOverlay({
  tier,
  onDismiss
}: {
  tier: { key: string; icon: string; description: string; prayers: number; modules: number };
  onDismiss: () => void;
}) {
  return (
    <div className="tier-upgrade-overlay" role="dialog" aria-modal="true" aria-label="Tier upgrade">
      <div className="tier-upgrade-overlay__card">
        <div className="tier-upgrade-overlay__icon" aria-hidden="true">
          {tier.icon}
        </div>
        <p className="eyebrow">New tier</p>
        <h2>{tier.key}</h2>
        <p>{tier.description}</p>
        <p className="tier-upgrade-overlay__meta">
          You earned this by {tier.prayers} prayers and {tier.modules} modules.
        </p>
        <button type="button" className="button button--primary" onClick={onDismiss}>
          Continue your practice {"->"}
        </button>
      </div>
    </div>
  );
}

export function UxProvider({
  user,
  children
}: {
  user: UserSession | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [store, dispatch] = useReducer(uxReducer, {
    ready: !user?.id,
    state: defaultUxState
  });
  const [timestampAnchor] = useState(() => Date.now());
  const [toastQueue, setToastQueue] = useState<ToastNotice[]>([]);
  const [tierUpgrade, setTierUpgrade] = useState<{
    key: string;
    icon: string;
    description: string;
    prayers: number;
    modules: number;
  } | null>(null);
  const { ready, state } = store;

  useEffect(() => {
    if (!user?.id) {
      dispatch({ type: "reset" });
      return;
    }

    const stored = readUxState(user.id);
    const pending = consumePendingOnboarding();
    const nextState =
      pending && !stored.onboardingStartedAt
        ? getNextState(stored, {
            onboardingStartedAt: pending
          })
        : stored;

    if (pending && !stored.onboardingStartedAt) {
      trackEvent("onboarding_started", { source: "register" });
      writeUxState(user.id, nextState);
    }

    dispatch({ type: "hydrate", state: nextState });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !ready) return;
    writeUxState(user.id, state);
  }, [ready, state, user?.id]);

  useEffect(() => {
    if (!toastQueue.length) return;
    const timer = window.setTimeout(() => {
      setToastQueue((current) => current.slice(1));
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [toastQueue]);

  useEffect(() => {
    if (!tierUpgrade) return;
    const timer = window.setTimeout(() => {
      setTierUpgrade(null);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [tierUpgrade]);

  const showSetupCompleteBanner = useMemo(() => {
    if (!state.onboardingCompletedAt || state.onboardingCompletedBannerDismissedAt) {
      return false;
    }
    const completionTime = new Date(state.onboardingCompletedAt).getTime();
    return timestampAnchor - completionTime < 7 * 24 * 60 * 60 * 1000;
  }, [state.onboardingCompletedAt, state.onboardingCompletedBannerDismissedAt, timestampAnchor]);

  const commit = (patch: Partial<UxState>) => {
    dispatch({ type: "patch", patch });
  };

  const value = useMemo<UxContextValue>(
    () => ({
      state,
      ready,
      showWelcomeOverlay: false,
      showSetupCompleteBanner,
      completeOnboarding: (details) => {
        commit({
          onboardingSelection: details?.selection || state.onboardingSelection,
          onboardingCountry: details?.country || state.onboardingCountry,
          onboardingTimezone: details?.timezone || state.onboardingTimezone,
          onboardingDeitySlugs:
            details?.deitySlugs && details.deitySlugs.length
              ? details.deitySlugs
              : state.onboardingDeitySlugs
        });
      },
      skipOnboarding: () => {
        commit({ onboardingSkippedAt: nowIso() });
        trackEvent("onboarding_skipped", { source: "route" });
      },
      markPrayerOpened: (slug) => {
        if (!slug) return;
        dispatch({
          type: "update",
          updater: (current) => {
          if (current.firstPrayerSlug === slug && current.prayerOpenCount > 0) {
            return current;
          }
          const isFirst = current.prayerOpenCount === 0;
          if (isFirst) {
            trackEvent("first_prayer_opened", { slug });
          }
          return getNextState(current, {
            firstPrayerSlug: current.firstPrayerSlug || slug,
            firstPrayerOpenedAt: current.firstPrayerOpenedAt || nowIso(),
            prayerOpenCount: current.prayerOpenCount + 1
          });
          }
        });
      },
      markPrayer60s: (slug) => {
        dispatch({
          type: "update",
          updater: (current) => {
          if (current.firstPrayer60sAt) return current;
          trackEvent("first_prayer_60s", { slug });
          return getNextState(current, {
            firstPrayer60sAt: nowIso()
          });
          }
        });
      },
      markVisitedPujas: () => {
        dispatch({
          type: "update",
          updater: (current) =>
            current.visitedPujas ? current : getNextState(current, { visitedPujas: true })
        });
      },
      dismissPrompt: (key) => {
        commit({ [key]: nowIso() } as Partial<UxState>);
      },
      dismissFirstPrayerBanner: () => {
        commit({ firstPrayerBannerDismissedAt: nowIso() });
      },
      markSharedPrayerCreated: () => {
        dispatch({
          type: "update",
          updater: (current) => {
          if (current.sharedPrayerCreatedAt) return current;
          trackEvent("shared_session_created");
          return getNextState(current, { sharedPrayerCreatedAt: nowIso() });
          }
        });
      },
      markLearningPathOpened: (deityId) => {
        dispatch({
          type: "update",
          updater: (current) => {
          if (current.learningPathOpenedAt) return current;
          trackEvent("learning_path_opened", { deityId });
          return getNextState(current, { learningPathOpenedAt: nowIso() });
          }
        });
      },
      markGiftStarted: () => {
        dispatch({
          type: "update",
          updater: (current) => {
          if (current.giftStartedAt) return current;
          trackEvent("gift_booking_started");
          return getNextState(current, { giftStartedAt: nowIso() });
          }
        });
      },
      markGiftCompleted: () => {
        dispatch({
          type: "update",
          updater: (current) => {
          if (current.giftCompletedAt) return current;
          trackEvent("gift_booking_completed");
          return getNextState(current, { giftCompletedAt: nowIso() });
          }
        });
      },
      markVideoWatched: (bookingId) => {
        dispatch({
          type: "update",
          updater: (current) => {
          if (current.videoWatchedAt) return current;
          trackEvent("video_watched", { bookingId: bookingId || null });
          return getNextState(current, { videoWatchedAt: nowIso() });
          }
        });
      },
      markFeatureUsed: (feature) => {
        if (feature === "shared_prayer") {
          commit({ sharedPrayerCreatedAt: state.sharedPrayerCreatedAt || nowIso() });
          return;
        }
        if (feature === "gift_puja") {
          commit({ giftCompletedAt: state.giftCompletedAt || nowIso() });
          return;
        }
        if (feature === "learning_path") {
          commit({ learningPathOpenedAt: state.learningPathOpenedAt || nowIso() });
          return;
        }
        if (feature === "sacred_video") {
          commit({ videoWatchedAt: state.videoWatchedAt || nowIso() });
        }
      },
      announceGamification: (result) => {
        if (!result) return;
        if (result.milestonesEarned?.length) {
          const nextToasts = result.milestonesEarned.map((milestone, index) => ({
            ...milestone,
            id: `${milestone.key}-${milestone.earnedAt || Date.now()}-${index}`
          }));
          playSoftBell();
          setToastQueue((current) => current.concat(nextToasts));
        }
        if (result.tierUpgrade?.currentTier) {
          setTierUpgrade({
            key: result.tierUpgrade.currentTier.key,
            icon: result.tierUpgrade.currentTier.icon,
            description: result.tierUpgrade.currentTier.description,
            prayers: Number(result.stats?.prayersCompletedCount || 0),
            modules: Number(result.stats?.modulesCompletedCount || 0)
          });
        }
      }
    }),
    [ready, showSetupCompleteBanner, state]
  );

  function closeWelcome(skipped: boolean) {
    commit({
      showWelcomeOverlay: false,
      onboardingSkippedAt: skipped ? nowIso() : state.onboardingSkippedAt
    });
    if (skipped) {
      trackEvent("onboarding_skipped");
      router.push("/home");
    }
  }

  function selectWelcome(selection: "pray" | "book" | "together" | "learn") {
    commit({
      showWelcomeOverlay: false,
      onboardingSelection: selection
    });
    trackEvent("onboarding_tile_clicked", { tile: selection });

    const nextHref =
      selection === "pray"
        ? "/prayers"
        : selection === "book"
          ? "/pujas"
          : selection === "together"
            ? "/sessions/create"
            : "/prayers#learning-paths";
    router.push(nextHref);
  }

  return (
    <UxContext.Provider value={value}>
      {children}
      {user && pathname !== "/login" && pathname !== "/register" && value.showWelcomeOverlay ? (
        <WelcomeOverlay
          firstName={user.name.split(" ")[0] || user.name}
          onClose={closeWelcome}
          onSelect={selectWelcome}
        />
      ) : null}
      {toastQueue[0] ? (
        <MilestoneToast toast={toastQueue[0]} onDismiss={() => setToastQueue((current) => current.slice(1))} />
      ) : null}
      {tierUpgrade ? <TierUpgradeOverlay tier={tierUpgrade} onDismiss={() => setTierUpgrade(null)} /> : null}
    </UxContext.Provider>
  );
}

export function useUx() {
  const context = useContext(UxContext);
  if (!context) {
    throw new Error("useUx must be used within UxProvider.");
  }
  return context;
}

export function InlineDismissLink({
  children,
  href,
  onClick
}: {
  children: ReactNode;
  href: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className="inline-link"
      onClick={() => {
        onClick?.();
      }}
    >
      {children}
    </Link>
  );
}
