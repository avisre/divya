"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { ApiRequestError, sendJson } from "../../lib/client-api";
import { cn } from "../../lib/cn";
import { trackEvent } from "../../lib/analytics";
import { wasDismissedWithinDays } from "../../lib/ux-state";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";
import { useGuidedFlow } from "../ux/GuidedFlowProvider";
import { useUx } from "../ux/UxProvider";
import type { Puja, PujaBooking } from "../../lib/types";

type BookingValues = {
  devoteeName: string;
  gothram: string;
  nakshatra: string;
  prayerIntention: string;
  surnameCommunity: string;
  familyRegion: string;
  knownFamilyGothram: string;
  recipientName: string;
  giftMessage: string;
  recipientEmail: string;
  preferredDate: string;
};

const nakshatras = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashirsha",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati"
];

function FieldHelp({
  open,
  onToggle,
  children
}: {
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <span className="field__info">
      <button type="button" className="field__info-trigger" aria-expanded={open} onClick={onToggle}>
        i
      </button>
      {open ? <span className="field__info-popover">{children}</span> : null}
    </span>
  );
}

function buildRequestedDateRange(preferredDate?: string) {
  if (!preferredDate) return undefined;

  return {
    start: new Date(`${preferredDate}T00:00:00.000Z`).toISOString(),
    end: new Date(`${preferredDate}T23:59:59.999Z`).toISOString()
  };
}

export function BookingPanel({
  puja,
  isAuthenticated,
  currentTier
}: {
  puja: Puja;
  isAuthenticated: boolean;
  currentTier: "free" | "bhakt" | "seva";
}) {
  const [mode, setMode] = useState<"self" | "gift">("self");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [waitlistLimitBooking, setWaitlistLimitBooking] = useState<Pick<PujaBooking, "_id" | "bookingReference" | "status" | "puja"> | null>(null);
  const [showSubmitAnimation, setShowSubmitAnimation] = useState(false);
  const [openHelper, setOpenHelper] = useState<null | "gothram" | "nakshatra">(null);
  const waitlistPaywallTrackedRef = useRef(false);
  const { dismissPrompt, markGiftCompleted, markGiftStarted, state } = useUx();
  const { familyName, suppressPrompts } = useGuidedFlow();
  const today = new Date().toISOString().slice(0, 10);
  const waitlistPromptDismissed = wasDismissedWithinDays(state.waitlistPaywallDismissedAt, 7);
  const { register, handleSubmit, getValues, setValue, watch } = useForm<BookingValues>({
    defaultValues: {
      devoteeName: "",
      gothram: "",
      nakshatra: "",
      prayerIntention: "",
      surnameCommunity: "",
      familyRegion: "",
      knownFamilyGothram: "",
      recipientName: "",
      giftMessage: "",
      recipientEmail: "",
      preferredDate: ""
    }
  });

  useEffect(() => {
    if (familyName && !getValues("devoteeName")) {
      setValue("devoteeName", familyName);
    }
  }, [familyName, getValues, setValue]);

  const quickReasons = useMemo(() => puja.bestFor?.slice(0, 3) || [], [puja.bestFor]);
  const preferredDate = watch("preferredDate");

  useEffect(() => {
    if (!waitlistLimitBooking || waitlistPromptDismissed || waitlistPaywallTrackedRef.current || suppressPrompts) {
      return;
    }
    waitlistPaywallTrackedRef.current = true;
    trackEvent("Paywall Seen", { type: "puja_limit", puja_name: puja.name.en });
  }, [puja.name.en, suppressPrompts, waitlistLimitBooking, waitlistPromptDismissed]);

  if (!isAuthenticated) {
    return (
      <div className="surface-card">
        <h3>Sign in to join the temple waitlist</h3>
        <p>Email sign-in keeps your booking, video, and support history private to your account.</p>
        <div className="card-actions">
          <Button href={`/login?next=${encodeURIComponent(`/pujas/${puja._id}`)}`}>Sign in to continue</Button>
          <Button tone="secondary" href="/register">
            Create account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card booking-panel">
      <p className="eyebrow">Join the sacred waitlist</p>
      <p className="muted">
        {mode === "gift"
          ? "Honor someone by offering this puja in their name and sending them the sacred recording after the ceremony."
          : "Submit your family name, prayer intention, and optional preferred date. Subject to temple schedule confirmation."}
      </p>

      <form
        className="form-grid"
      onSubmit={handleSubmit(async (values) => {
        setPending(true);
        setStatus("");
        setWaitlistLimitBooking(null);
        waitlistPaywallTrackedRef.current = false;
        try {
            const playConfirmation = async (message: string) => {
              setStatus(message);
              setShowSubmitAnimation(true);
              await new Promise((resolve) => window.setTimeout(resolve, 600));
              setShowSubmitAnimation(false);
            };

            const requestedDateRange = buildRequestedDateRange(values.preferredDate);

            if (mode === "gift") {
              if (!values.recipientName.trim()) {
                throw new Error("Recipient name is required for a gift puja.");
              }
              if (!values.recipientEmail.trim()) {
                throw new Error("An email is required to send the gift confirmation.");
              }

              const payload = await sendJson<{ booking: PujaBooking }>("/api/backend/bookings/gift", {
                method: "POST",
                body: JSON.stringify({
                  pujaId: puja._id,
                  devoteeName: values.recipientName,
                  prayerIntention:
                    values.giftMessage.trim() || `Temple offering gifted for ${values.recipientName}.`,
                  requestedDateRange,
                  giftDetails: {
                    isGift: true,
                    recipientName: values.recipientName,
                    recipientEmail: values.recipientEmail,
                    personalMessage: values.giftMessage.trim() || undefined,
                    giftOccasion: "general_blessing"
                  }
                })
              });
              await playConfirmation("Gift booking request submitted.");
              trackEvent("Puja Booked", { puja_name: puja.name.en, user_tier: currentTier });
              markGiftCompleted();
              window.location.assign(`/bookings/${payload.booking._id}?confirmed=1`);
            } else {
              const payload = await sendJson<{ booking: PujaBooking }>("/api/backend/bookings", {
                method: "POST",
                headers: {
                  "x-idempotency-key": `${puja._id}-${values.devoteeName}-${Date.now()}`
                },
                body: JSON.stringify({
                  pujaId: puja._id,
                  devoteeName: values.devoteeName,
                  gothram: values.gothram,
                  nakshatra: values.nakshatra,
                  prayerIntention: values.prayerIntention,
                  requestedDateRange
                })
              });
              await playConfirmation("Puja request submitted.");
              trackEvent("Puja Booked", { puja_name: puja.name.en, user_tier: currentTier });
              window.location.assign(`/bookings/${payload.booking._id}?confirmed=1`);
            }
          } catch (error) {
            if (error instanceof ApiRequestError) {
              const details = error.payload?.details as
                | { reason?: string; activeBooking?: Pick<PujaBooking, "_id" | "bookingReference" | "status" | "puja"> }
                | undefined;
              if (details?.reason === "waitlist_limit" && details.activeBooking) {
                setWaitlistLimitBooking(details.activeBooking);
                setStatus("");
                return;
              }
            }
            setStatus(error instanceof Error ? error.message : "Unable to submit your request.");
          } finally {
            setPending(false);
          }
        })}
      >
        {mode === "self" ? (
          <>
            <label className="field">
              <span>Devotee name</span>
              <input data-testid="booking-family-name" {...register("devoteeName")} />
            </label>
            <label className="field">
              <span>Family surname or community</span>
              <input {...register("surnameCommunity")} />
            </label>
            <label className="field">
              <span>Family region</span>
              <input {...register("familyRegion")} />
            </label>
            <label className="field">
              <span>Known family gothram</span>
              <input {...register("knownFamilyGothram")} />
            </label>
            <label className="field">
              <span className="field__label">
                <span className="field__label-text">Gothram</span>
                <FieldHelp
                  open={openHelper === "gothram"}
                  onToggle={() => setOpenHelper((current) => (current === "gothram" ? null : "gothram"))}
                >
                  Your family lineage name, for example Kashyap, Bharadwaj, or Vasishtha. Ask a parent
                  or grandparent if you are unsure. If you still do not know, write Unknown and the
                  Tantri will record what you provide.
                </FieldHelp>
              </span>
              <input {...register("gothram")} />
            </label>
            <div className="field field--actions">
              <span>Need help?</span>
              <Button
                type="button"
                tone="secondary"
                onClick={async () => {
                  try {
                    const payload = await sendJson<{
                      gothram: string;
                      guidanceText: string;
                    }>("/api/backend/bookings/gothram-suggest", {
                      method: "POST",
                      body: JSON.stringify({
                        devoteeName: getValues("devoteeName"),
                        surnameCommunity: getValues("surnameCommunity"),
                        familyRegion: getValues("familyRegion"),
                        knownFamilyGothram: getValues("knownFamilyGothram")
                      })
                    });
                    setValue("gothram", payload.gothram);
                    setStatus(payload.guidanceText);
                  } catch (error) {
                    setStatus(error instanceof Error ? error.message : "Unable to suggest gothram.");
                  }
                }}
              >
                Find my gothram
              </Button>
            </div>
            <label className="field">
              <span className="field__label">
                <span className="field__label-text">Nakshatra</span>
                <FieldHelp
                  open={openHelper === "nakshatra"}
                  onToggle={() => setOpenHelper((current) => (current === "nakshatra" ? null : "nakshatra"))}
                >
                  Your birth star in the Hindu lunar calendar. If you do not know yours, use any free
                  nakshatra calculator with your birth date, time, and place.
                </FieldHelp>
              </span>
              <select {...register("nakshatra")}>
                <option value="">Select your nakshatra</option>
                {nakshatras.map((nakshatra) => (
                  <option key={nakshatra} value={nakshatra}>
                    {nakshatra}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--full">
              <span>Prayer intention</span>
              <textarea
                rows={6}
                placeholder="What are you hoping for your family? Peace and good health for my parents / My daughter's exams / Safe move to a new city / Gratitude for this year"
                {...register("prayerIntention")}
              />
            </label>
          </>
        ) : (
          <>
            <label className="field">
              <span>Recipient&apos;s name</span>
              <input {...register("recipientName")} />
            </label>
            <label className="field">
              <span>Send gift confirmation to</span>
              <input type="email" {...register("recipientEmail")} />
            </label>
            <label className="field field--full">
              <span>Your message</span>
              <textarea
                rows={5}
                maxLength={200}
                placeholder="Optional note to include with the gift confirmation."
                {...register("giftMessage")}
              />
            </label>
          </>
        )}

        <label className="field field--full">
          <span>Preferred date (optional)</span>
          <input type="date" min={today} {...register("preferredDate")} />
          <small className="muted">Subject to temple schedule confirmation.</small>
        </label>

        {quickReasons.length ? (
          <div className="pill-row pill-row--full">
            {quickReasons.map((reason) => (
              <span key={reason} className="pill">
                {reason}
              </span>
            ))}
          </div>
        ) : null}

        {showSubmitAnimation ? (
          <div className={cn("booking-panel__success-bloom", "booking-panel__success-bloom--active")} aria-live="polite">
            <span className="booking-panel__success-mark" aria-hidden="true">
              {"\u0950"}
            </span>
            <span>Temple request received.</span>
          </div>
        ) : null}
        {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
        {waitlistLimitBooking && !suppressPrompts ? (
          <div
            data-testid="waitlist-limit-prompt"
            className={cn(
              "field field--full surface-card waitlist-limit-card",
              waitlistPromptDismissed && "waitlist-limit-card--compact"
            )}
          >
            {!waitlistPromptDismissed ? (
              <button
                type="button"
                className="discovery-banner__dismiss"
                onClick={() => dismissPrompt("waitlistPaywallDismissedAt")}
                aria-label="Dismiss waitlist upgrade prompt"
              >
                x
              </button>
            ) : null}
            <h3>You have one active waitlist</h3>
            {!waitlistPromptDismissed ? (
              <p>
                Free accounts can hold one puja waitlist at a time. Bhakt removes this limit and gives
                priority scheduling.
              </p>
            ) : (
              <p>Bhakt removes the one-waitlist limit on free accounts.</p>
            )}
            <div className="card-actions">
              <Button data-testid="manage-waitlist-link" href={`/bookings/${waitlistLimitBooking._id}`}>Manage your current waitlist</Button>
              <Button
                tone="secondary"
                href="/plans?highlight=bhakt"
                onClick={() =>
                  trackEvent("Upgrade Clicked", {
                    from_tier: currentTier,
                    to_tier: "bhakt",
                    trigger: "paywall_puja"
                  })
                }
              >
                Upgrade to Bhakt
              </Button>
            </div>
          </div>
        ) : (
          <div className="field field--full">
            <Button data-testid="join-waitlist-btn" data-guided-target="join-waitlist" type="submit" disabled={pending} block>
              {pending ? "Submitting..." : mode === "gift" ? "Book gift puja" : "Join sacred waitlist"}
            </Button>
          </div>
        )}
        <div className="field field--full">
          {mode === "gift" ? (
            <button type="button" className="text-button" onClick={() => setMode("self")}>
              Back to booking for myself
            </button>
          ) : (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                markGiftStarted();
                setMode("gift");
              }}
            >
              Book this as a gift {"->"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
