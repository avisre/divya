"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import { sendJson } from "../../lib/client-api";
import { trackEvent } from "../../lib/analytics";
import type { GuidedFlowState, UserSession } from "../../lib/types";
import { Button } from "../ui/Button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type GuidedFlowContextValue = {
  familyName: string;
  familyNameSkipped: boolean;
  guidedFlow: GuidedFlowState;
  isActive: boolean;
  suppressPrompts: boolean;
  hasResumeLink: boolean;
  resumeStep: number;
  startGuidedFlow: () => Promise<void>;
  resumeGuidedFlow: () => Promise<void>;
  exitGuidedFlow: () => Promise<void>;
  syncProfileState: (patch: {
    familyName?: string;
    familyNameSkipped?: boolean;
    guidedFlow?: GuidedFlowState;
  }) => void;
  saveFamilyNameAndContinue: (value: string) => Promise<void>;
  skipFamilyNameAndContinue: () => Promise<void>;
};

const defaultGuidedFlowState: GuidedFlowState = {
  active: false,
  currentStep: 1,
  completedSteps: [],
  startedAt: null,
  completedAt: null,
  exitedAt: null,
  exitedOnStep: null
};

const GuidedFlowContext = createContext<GuidedFlowContextValue | null>(null);

function normalizeGuidedFlowState(value: UserSession["guidedFlow"]): GuidedFlowState {
  if (!value) {
    return defaultGuidedFlowState;
  }

  return {
    active: Boolean(value.active),
    currentStep: Math.min(5, Math.max(1, Number(value.currentStep || 1))),
    completedSteps: Array.isArray(value.completedSteps)
      ? [...new Set(value.completedSteps.map((step) => Number(step)).filter((step) => step >= 1 && step <= 5))]
      : [],
    startedAt: value.startedAt || null,
    completedAt: value.completedAt || null,
    exitedAt: value.exitedAt || null,
    exitedOnStep: value.exitedOnStep ?? null
  };
}

function mergeCompletedSteps(current: number[], step: number) {
  return [...new Set([...current, step])].sort((left, right) => left - right);
}

function isPrayerDetailPath(pathname: string) {
  return /^\/prayers\/[^/]+$/.test(pathname);
}

function isPujaDetailPath(pathname: string) {
  return /^\/pujas\/[^/]+$/.test(pathname);
}

function getRequiredRouteForStep(step: number) {
  if (step === 1) return "/home";
  if (step === 2) return "/prayers";
  if (step === 3) return "/pujas";
  if (step === 4) return "/profile";
  return "/home";
}

function stepAllowsPath(step: number, pathname: string) {
  if (step === 1) return pathname.startsWith("/home");
  if (step === 2) return pathname === "/prayers" || isPrayerDetailPath(pathname);
  if (step === 3) return pathname === "/pujas" || isPujaDetailPath(pathname);
  if (step === 4) return pathname.startsWith("/profile");
  if (step === 5) return pathname.startsWith("/home");
  return false;
}

function getSpotlightSelector(step: number, pathname: string) {
  if (step === 1) return '[data-guided-target="panchang-summary"]';
  if (step === 2) {
    return isPrayerDetailPath(pathname)
      ? '[data-guided-target="prayer-audio-toggle"]'
      : '[data-guided-target="starter-prayer-card"]';
  }
  if (step === 3) {
    return isPujaDetailPath(pathname)
      ? '[data-guided-target="join-waitlist"]'
      : '[data-guided-target="starter-puja-card"]';
  }
  if (step === 4) return '[data-guided-target="profile-family-name"]';
  return null;
}

function scrollTargetIntoView(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  if (rect.top >= 32 && rect.bottom <= window.innerHeight - 32) {
    return;
  }

  target.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function getStarterLink(targetSelector: string, fallbackHref: string) {
  const target = document.querySelector(targetSelector);
  const link = target?.querySelector('a[href]') as HTMLAnchorElement | null;
  return link?.getAttribute("href") || fallbackHref;
}

function getSpotlightTitle(selector: string, fallback: string) {
  const target = document.querySelector(selector);
  const heading = target?.querySelector("h2, h3, strong");
  const text = heading?.textContent?.trim();
  return text || fallback;
}

function getPanchangTithiName() {
  const element = document.querySelector("[data-guided-panchang-tithi]");
  return element?.textContent?.trim() || "today's tithi";
}

function GuidanceDots({ currentStep, completedSteps }: { currentStep: number; completedSteps: number[] }) {
  return (
    <div className="guided-flow__dots" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => {
        const step = index + 1;
        const state = completedSteps.includes(step)
          ? "completed"
          : step === currentStep
            ? "current"
            : "upcoming";

        return <span key={step} data-testid="guided-step-dot" data-state={state} className={`guided-flow__dot guided-flow__dot--${state}`} />;
      })}
    </div>
  );
}

function GuidedFlowCard({
  familyName,
  familyNameSkipped,
  guidedFlow,
  pathname,
  onNavigate,
  onOpenLearn,
  onAdvance,
  onExit,
  onSaveFamilyName,
  onSkipFamilyName,
  onComplete,
  onInstall
}: {
  familyName: string;
  familyNameSkipped: boolean;
  guidedFlow: GuidedFlowState;
  pathname: string;
  onNavigate: (href: string) => void;
  onOpenLearn: (href: string) => void;
  onAdvance: (nextStep: number, href: string) => void;
  onExit: () => void;
  onSaveFamilyName: (value: string) => void;
  onSkipFamilyName: () => void;
  onComplete: () => void;
  onInstall: () => void;
}) {
  const [inlineFamilyName, setInlineFamilyName] = useState(familyName);
  const tithiName = getPanchangTithiName();
  const prayerTitle = getSpotlightTitle('[data-guided-target="starter-prayer-card"]', "the starter prayer");
  const pujaTitle = getSpotlightTitle('[data-guided-target="starter-puja-card"]', "this offering");
  const onPrayerDetail = isPrayerDetailPath(pathname);
  const onPujaDetail = isPujaDetailPath(pathname);

  useEffect(() => {
    setInlineFamilyName(familyName);
  }, [familyName]);

  if (guidedFlow.currentStep === 5) {
    return (
      <div className="guided-flow__completion" role="dialog" aria-modal="true" aria-label="Guided flow completion">
        <div className="guided-flow__completion-card">
          <div className="guided-flow__completion-symbol" aria-hidden="true">
            {"\u0950"}
          </div>
          <h2>You are ready.</h2>
          <p>
            Your account is connected to Bhadra Bhagavathi Temple. Every prayer you read, every puja you
            book, and every video in your archive is private to this account.
          </p>
          <div className="guided-flow__completion-divider" aria-hidden="true" />
          <div className="guided-flow__completion-list">
            <p>1. Read one prayer - even the first verse is a complete act of devotion.</p>
            <p>2. Check today&apos;s panchang - it will tell you if today is auspicious for an offering.</p>
            <p>3. Save Prarthana to your home screen - so the daily rhythm is one tap away.</p>
          </div>
          <div className="guided-flow__completion-divider" aria-hidden="true" />
          <p>
            Your free account is yours to keep. Bhakt and Seva are there when your family wants more.
          </p>
          <div className="guided-flow__completion-actions">
            <Button data-testid="guided-flow-complete-cta" onClick={onComplete} block>
              Begin - open the prayer library
            </Button>
            <Button tone="secondary" type="button" onClick={onInstall} block>
              Save to home screen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guided-flow__card" role="dialog" aria-modal="true" aria-label="Guided introduction">
      <div className="guided-flow__card-copy">
        <p data-testid="guided-step-indicator" className="guided-flow__step-label">
          Step {guidedFlow.currentStep} of 5
        </p>
        <GuidanceDots currentStep={guidedFlow.currentStep} completedSteps={guidedFlow.completedSteps} />

        {guidedFlow.currentStep === 1 ? (
          <>
            <h2>This is today&apos;s sacred timing.</h2>
            <p>
              Every day begins with the tithi - the lunar day that shapes which prayers and offerings
              carry the most meaning. Today is {tithiName}.
            </p>
            <Link
              data-testid="guided-panchang-learn-link"
              href="/learn/the-panchang-explained"
              className="inline-link"
              onClick={(event) => {
                event.preventDefault();
                onOpenLearn("/learn/the-panchang-explained");
              }}
            >
              What does this mean for today?
            </Link>
            <div className="guided-flow__actions">
              <Button data-testid="guided-continue" type="button" onClick={() => onAdvance(2, "/prayers")} block>
                Continue
              </Button>
              <button data-testid="guided-exit" type="button" className="guided-flow__secondary-link" onClick={onExit}>
                Exit introduction
              </button>
            </div>
          </>
        ) : null}

        {guidedFlow.currentStep === 2 && !onPrayerDetail ? (
          <>
            <h2>This is a guided prayer.</h2>
            <p>
              Each prayer shows you the Sanskrit text, its transliteration, and its meaning. Audio plays
              alongside so you can follow without knowing the script.
            </p>
            <p>Open it and read the first verse.</p>
            <div className="guided-flow__actions">
              <Button
                data-testid="guided-continue"
                type="button"
                onClick={() =>
                  onNavigate(getStarterLink('[data-guided-target="starter-prayer-card"]', "/prayers"))
                }
                block
              >
                Open {prayerTitle} {"->"}
              </Button>
              <button type="button" className="guided-flow__secondary-link" onClick={() => onAdvance(3, "/pujas")}>
                Continue without opening
              </button>
              <button data-testid="guided-exit" type="button" className="guided-flow__secondary-link" onClick={onExit}>
                Exit
              </button>
            </div>
          </>
        ) : null}

        {guidedFlow.currentStep === 2 && onPrayerDetail ? (
          <>
            <h2>Notice the audio button at the top.</h2>
            <p>
              Press play to hear the correct pronunciation before following the text. This is how the
              prayer is meant to be learned - listening first.
            </p>
            <p>When you are ready, continue.</p>
            <div className="guided-flow__actions">
              <Button data-testid="guided-continue" type="button" onClick={() => onAdvance(3, "/pujas")} block>
                Continue
              </Button>
              <button data-testid="guided-exit" type="button" className="guided-flow__secondary-link" onClick={onExit}>
                Exit
              </button>
            </div>
          </>
        ) : null}

        {guidedFlow.currentStep === 3 && !onPujaDetail ? (
          <>
            <h2>A puja is performed at the temple on your behalf.</h2>
            <p>
              You join a waitlist, your family&apos;s name is spoken aloud by the Tantri during the
              ceremony, and a private HD recording is delivered to your account within 48 hours.
            </p>
            <p>You do not need to be present. The intention travels without you.</p>
            <div className="guided-flow__actions">
              <Button
                data-testid="guided-continue"
                type="button"
                onClick={() =>
                  onNavigate(getStarterLink('[data-guided-target="starter-puja-card"]', "/pujas"))
                }
                block
              >
                See what {pujaTitle} includes {"->"}
              </Button>
              <button type="button" className="guided-flow__secondary-link" onClick={() => onAdvance(4, "/profile")}>
                Continue without viewing
              </button>
              <button data-testid="guided-exit" type="button" className="guided-flow__secondary-link" onClick={onExit}>
                Exit
              </button>
            </div>
          </>
        ) : null}

        {guidedFlow.currentStep === 3 && onPujaDetail ? (
          <>
            <h2>This is the waitlist.</h2>
            <p>
              Pujas are temple-led. Joining the waitlist places your family in the real queue. You will
              be notified of your ceremony date within 24 hours of booking.
            </p>
            <p>You do not need to book now.</p>
            <div className="guided-flow__actions">
              <Button data-testid="guided-continue" type="button" onClick={() => onAdvance(4, "/profile")} block>
                Continue
              </Button>
              <button data-testid="guided-exit" type="button" className="guided-flow__secondary-link" onClick={onExit}>
                Exit
              </button>
            </div>
          </>
        ) : null}

        {guidedFlow.currentStep === 4 ? (
          <>
            <h2>Your family name is how the temple knows you.</h2>
            <p>
              When a puja is performed, the Tantri speaks your family name aloud during the offering.
              This is the name that travels to the temple.
            </p>
            <p>{familyNameSkipped ? "You skipped this before. Add it now if you are ready." : "If this field is empty, add your family name now."}</p>
            <label className="field">
              <span>Family name</span>
              <input
                data-testid="guided-family-name-input"
                value={inlineFamilyName}
                onChange={(event) => setInlineFamilyName(event.target.value)}
              />
            </label>
            <div className="guided-flow__actions">
              <Button
                data-testid="guided-save-continue"
                type="button"
                onClick={() => onSaveFamilyName(inlineFamilyName)}
                block
              >
                Save and continue
              </Button>
              <button
                data-testid="guided-skip-family-name"
                type="button"
                className="guided-flow__secondary-link"
                onClick={onSkipFamilyName}
              >
                Skip for now
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function GuidedFlowProvider({
  user,
  children
}: {
  user: UserSession | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [familyName, setFamilyName] = useState(user?.familyName || "");
  const [familyNameSkipped, setFamilyNameSkipped] = useState(Boolean(user?.familyNameSkipped));
  const [guidedFlow, setGuidedFlow] = useState<GuidedFlowState>(
    normalizeGuidedFlowState(user?.guidedFlow)
  );
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const spotlightCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!guidedFlow.active || stepAllowsPath(guidedFlow.currentStep, pathname)) {
      return;
    }

    router.push(getRequiredRouteForStep(guidedFlow.currentStep));
  }, [guidedFlow.active, guidedFlow.currentStep, pathname, router]);

  useEffect(() => {
    if (spotlightCleanupRef.current) {
      spotlightCleanupRef.current();
      spotlightCleanupRef.current = null;
    }

    if (!guidedFlow.active) {
      return;
    }

    const selector = getSpotlightSelector(guidedFlow.currentStep, pathname);
    if (!selector) {
      return;
    }

    let active = true;
    let retries = 0;
    let retryTimer: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;

    const applySpotlight = () => {
      const target = document.querySelector(selector) as HTMLElement | null;
      if (!target) {
        if (retries < 20 && active) {
          retries += 1;
          retryTimer = window.setTimeout(applySpotlight, 120);
        }
        return;
      }

      target.classList.add("guided-spotlight-target");
      scrollTargetIntoView(target);

      if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(() => {
          scrollTargetIntoView(target);
        });
        resizeObserver.observe(target);
      }

      if ("IntersectionObserver" in window) {
        intersectionObserver = new IntersectionObserver((entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting) {
            scrollTargetIntoView(target);
          }
        });
        intersectionObserver.observe(target);
      }

      spotlightCleanupRef.current = () => {
        target.classList.remove("guided-spotlight-target");
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
      };
    };

    applySpotlight();

    return () => {
      active = false;
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (spotlightCleanupRef.current) {
        spotlightCleanupRef.current();
        spotlightCleanupRef.current = null;
      }
    };
  }, [guidedFlow.active, guidedFlow.currentStep, pathname]);

  async function persistPatch(patch: {
    familyName?: string;
    familyNameSkipped?: boolean;
    guidedFlow?: GuidedFlowState;
  }) {
    const nextFamilyName = patch.familyName !== undefined ? patch.familyName : familyName;
    const nextFamilyNameSkipped =
      patch.familyNameSkipped !== undefined ? patch.familyNameSkipped : familyNameSkipped;
    const nextGuidedFlow = patch.guidedFlow !== undefined ? patch.guidedFlow : guidedFlow;

    setFamilyName(nextFamilyName);
    setFamilyNameSkipped(nextFamilyNameSkipped);
    setGuidedFlow(nextGuidedFlow);

    try {
      await sendJson("/api/backend/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          familyName: nextFamilyName,
          familyNameSkipped: nextFamilyNameSkipped,
          guidedFlow: nextGuidedFlow
        })
      });
    } catch {
      // Keep the local experience moving even if the profile sync retries later.
    }
  }

  async function startGuidedFlow() {
    const startedAt = new Date().toISOString();
    await persistPatch({
      guidedFlow: {
        active: true,
        currentStep: 1,
        completedSteps: [],
        startedAt,
        completedAt: null,
        exitedAt: null,
        exitedOnStep: null
      }
    });
    router.push("/home");
  }

  async function resumeGuidedFlow() {
    const resumeStep = guidedFlow.exitedOnStep || guidedFlow.currentStep || 1;
    await persistPatch({
      guidedFlow: {
        ...guidedFlow,
        active: true,
        currentStep: resumeStep,
        exitedAt: null,
        exitedOnStep: null,
        startedAt: guidedFlow.startedAt || new Date().toISOString()
      }
    });
    router.push(getRequiredRouteForStep(resumeStep));
  }

  async function exitGuidedFlow() {
    const exitedAt = new Date().toISOString();
    await persistPatch({
      guidedFlow: {
        ...guidedFlow,
        active: false,
        exitedAt,
        exitedOnStep: guidedFlow.currentStep
      }
    });
    trackEvent("Guided Flow Exited", { step: guidedFlow.currentStep });
  }

  async function advanceToStep(nextStep: number) {
    const nextGuidedFlow: GuidedFlowState = {
      ...guidedFlow,
      active: true,
      currentStep: nextStep,
      completedSteps: mergeCompletedSteps(guidedFlow.completedSteps, guidedFlow.currentStep),
      exitedAt: null,
      exitedOnStep: null,
      startedAt: guidedFlow.startedAt || new Date().toISOString()
    };
    await persistPatch({ guidedFlow: nextGuidedFlow });
  }

  async function saveFamilyNameAndContinue(value: string) {
    await persistPatch({
      familyName: value.trim(),
      familyNameSkipped: false,
      guidedFlow: {
        ...guidedFlow,
        active: true,
        currentStep: 5,
        completedSteps: mergeCompletedSteps(guidedFlow.completedSteps, guidedFlow.currentStep),
        exitedAt: null,
        exitedOnStep: null,
        startedAt: guidedFlow.startedAt || new Date().toISOString()
      }
    });
    router.push("/home");
  }

  async function skipFamilyNameAndContinue() {
    await persistPatch({
      familyNameSkipped: true,
      guidedFlow: {
        ...guidedFlow,
        active: true,
        currentStep: 5,
        completedSteps: mergeCompletedSteps(guidedFlow.completedSteps, guidedFlow.currentStep),
        exitedAt: null,
        exitedOnStep: null,
        startedAt: guidedFlow.startedAt || new Date().toISOString()
      }
    });
    router.push("/home");
  }

  async function completeGuidedFlow() {
    const completedSteps = mergeCompletedSteps(guidedFlow.completedSteps, 5);
    const completedAt = new Date().toISOString();
    await persistPatch({
      guidedFlow: {
        ...guidedFlow,
        active: false,
        currentStep: 5,
        completedSteps,
        completedAt,
        exitedAt: null,
        exitedOnStep: null,
        startedAt: guidedFlow.startedAt || new Date().toISOString()
      }
    });
    trackEvent("Guided Flow Completed", { stepsCompleted: completedSteps.length });
    router.push("/prayers");
  }

  async function triggerInstall() {
    if (installPromptEvent) {
      await installPromptEvent.prompt().catch(() => undefined);
      return;
    }
    router.push("/install");
  }

  const value: GuidedFlowContextValue = {
    familyName,
    familyNameSkipped,
    guidedFlow,
    isActive: guidedFlow.active,
    suppressPrompts: guidedFlow.active,
    hasResumeLink: Boolean(guidedFlow.exitedAt && !guidedFlow.completedAt),
    resumeStep: guidedFlow.exitedOnStep || guidedFlow.currentStep || 1,
    startGuidedFlow,
    resumeGuidedFlow,
    exitGuidedFlow,
    syncProfileState: (patch) => {
      if (patch.familyName !== undefined) {
        setFamilyName(patch.familyName);
      }
      if (patch.familyNameSkipped !== undefined) {
        setFamilyNameSkipped(patch.familyNameSkipped);
      }
      if (patch.guidedFlow !== undefined) {
        setGuidedFlow(patch.guidedFlow);
      }
    },
    saveFamilyNameAndContinue,
    skipFamilyNameAndContinue
  };

  return (
    <GuidedFlowContext.Provider value={value}>
      {children}
      {guidedFlow.active ? <div data-testid="guided-overlay" className="guided-overlay" aria-hidden="true" /> : null}
      {guidedFlow.active ? (
        <GuidedFlowCard
          familyName={familyName}
          familyNameSkipped={familyNameSkipped}
          guidedFlow={guidedFlow}
          pathname={pathname}
          onNavigate={(href) => router.push(href)}
          onOpenLearn={(href) => {
            void exitGuidedFlow().then(() => {
              router.push(href);
            });
          }}
          onAdvance={(nextStep, href) => {
            void advanceToStep(nextStep).then(() => {
              router.push(href);
            });
          }}
          onExit={() => {
            void exitGuidedFlow();
          }}
          onSaveFamilyName={(value) => {
            void saveFamilyNameAndContinue(value);
          }}
          onSkipFamilyName={() => {
            void skipFamilyNameAndContinue();
          }}
          onComplete={() => {
            void completeGuidedFlow();
          }}
          onInstall={() => {
            void triggerInstall();
          }}
        />
      ) : null}
    </GuidedFlowContext.Provider>
  );
}

export function useGuidedFlow() {
  const context = useContext(GuidedFlowContext);
  if (!context) {
    throw new Error("useGuidedFlow must be used within GuidedFlowProvider.");
  }
  return context;
}
