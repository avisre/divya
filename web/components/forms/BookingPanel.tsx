"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { sendJson } from "../../lib/client-api";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";
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
  recipientGothram: string;
  recipientNakshatra: string;
  recipientPrayerIntention: string;
  senderName: string;
  recipientEmail: string;
  giftOccasion: string;
};

const giftOccasions = [
  { value: "birthday", label: "Birthday", note: "Offer a puja to mark a loved one's birthday." },
  { value: "anniversary", label: "Anniversary", note: "Bless a marriage or family milestone." },
  { value: "new_home", label: "New home", note: "Carry temple blessing into a new household." },
  { value: "general_blessing", label: "General blessing", note: "A quiet gift of protection and care." }
];

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

export function BookingPanel({
  puja,
  isAuthenticated
}: {
  puja: Puja;
  isAuthenticated: boolean;
}) {
  const [mode, setMode] = useState<"self" | "gift">("self");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<PujaBooking | null>(null);
  const [showSubmitAnimation, setShowSubmitAnimation] = useState(false);
  const [openHelper, setOpenHelper] = useState<null | "gothram" | "nakshatra">(null);
  const { markGiftCompleted, markGiftStarted } = useUx();
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
      recipientGothram: "",
      recipientNakshatra: "",
      recipientPrayerIntention: "",
      senderName: "",
      recipientEmail: "",
      giftOccasion: "general_blessing"
    }
  });

  const quickReasons = useMemo(() => puja.bestFor?.slice(0, 3) || [], [puja.bestFor]);
  const selectedOccasion = watch("giftOccasion");

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

  if (submittedBooking) {
    const whatsappMessage =
      mode === "gift"
        ? `I have offered a ${puja.name.en} puja at Bhadra Bhagavathi Temple in your name. The Tantri will perform it soon. You will receive a recording when it is complete. With love, ${getValues("senderName") || getValues("devoteeName") || "your family"}.`
        : "";

    return (
      <div className="surface-card booking-confirmation">
        <p className="eyebrow">{mode === "gift" ? "Gift confirmed" : "Booking confirmed"}</p>
        <h3>{mode === "gift" ? "Your gift is with the temple." : "Your request is with the temple."}</h3>
        {mode === "gift" ? (
          <p>
            You have offered {puja.name.en} for {getValues("recipientName") || submittedBooking.devoteeName}.
            The Tantri will perform the puja in their name. A recording will be delivered to your
            bookings when it is complete.
          </p>
        ) : (
          <div className="timeline-steps">
            <div className="timeline-step">
              <strong>Step 1 - Today</strong>
              <p>
                Your booking is in the queue. The temple team reviews the waitlist weekly and
                assigns puja dates based on availability and auspicious timing.
              </p>
            </div>
            <div className="timeline-step">
              <strong>Step 2 - When confirmed</strong>
              <p>
                You will receive an email with the confirmed puja date and time. The Tantri will
                perform the ritual in your name.
              </p>
            </div>
            <div className="timeline-step">
              <strong>Step 3 - Within 48 hours</strong>
              <p>
                Your HD recording appears in bookings, private to your account and yours to keep.
              </p>
            </div>
          </div>
        )}
        <div className="card-actions">
          <Button href="/bookings">View my bookings {"->"}</Button>
          {mode === "gift" ? (
            <Button tone="secondary" href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}>
              Send them a message
            </Button>
          ) : (
            <Button tone="secondary" href="/pujas">
              Book another puja for a family member {"->"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card booking-panel">
      <p className="eyebrow">Who is this puja for?</p>
      <div className="booking-mode-grid">
        <button
          type="button"
          className={`selection-card booking-mode-card ${mode === "self" ? "selection-card--active" : ""}`}
          onClick={() => setMode("self")}
        >
          <span className="selection-card__eyebrow">For me</span>
          <strong>My name and gothram will be submitted to the temple.</strong>
        </button>
        <button
          type="button"
          className={`selection-card booking-mode-card ${mode === "gift" ? "selection-card--active" : ""}`}
          onClick={() => {
            setMode("gift");
            markGiftStarted();
          }}
        >
          <span className="selection-card__eyebrow">Gift to someone</span>
          <strong>{"I am offering this puja in another person\u2019s name."}</strong>
        </button>
      </div>

      <form
        className="form-grid"
        onSubmit={handleSubmit(async (values) => {
          setPending(true);
          setStatus("");
          try {
            const playConfirmation = async (message: string) => {
              setStatus(message);
              setShowSubmitAnimation(true);
              await new Promise((resolve) => window.setTimeout(resolve, 600));
              setShowSubmitAnimation(false);
            };

            if (mode === "gift") {
              if (!values.recipientName.trim()) {
                throw new Error("Recipient name is required for a gifted puja.");
              }
              if (!values.recipientEmail.trim()) {
                throw new Error("Recipient email is required so the temple recording can be delivered.");
              }

              const payload = await sendJson<{ booking: PujaBooking }>("/api/backend/bookings/gift", {
                method: "POST",
                body: JSON.stringify({
                  pujaId: puja._id,
                  devoteeName: values.recipientName,
                  gothram: values.recipientGothram,
                  nakshatra: values.recipientNakshatra,
                  prayerIntention: values.recipientPrayerIntention,
                  giftDetails: {
                    isGift: true,
                    recipientName: values.recipientName,
                    recipientEmail: values.recipientEmail,
                    giftOccasion: values.giftOccasion,
                    personalMessage: values.senderName
                      ? `Offered with love from ${values.senderName}.`
                      : undefined
                  }
                })
              });
              await playConfirmation("Gift booking request submitted.");
              setSubmittedBooking(payload.booking);
              markGiftCompleted();
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
                  prayerIntention: values.prayerIntention
                })
              });
              await playConfirmation("Puja request submitted.");
              setSubmittedBooking(payload.booking);
            }
          } catch (error) {
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
              <input {...register("devoteeName")} />
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
                <FieldHelp open={openHelper === "gothram"} onToggle={() => setOpenHelper((current) => (current === "gothram" ? null : "gothram"))}>
                  Your family lineage name, for example Kashyap, Bharadwaj, or Vasishtha. Ask a parent or grandparent if you are unsure. If you still do not know, write Unknown and the Tantri will record what you provide.
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
                <FieldHelp open={openHelper === "nakshatra"} onToggle={() => setOpenHelper((current) => (current === "nakshatra" ? null : "nakshatra"))}>
                  Your birth star in the Hindu lunar calendar. If you do not know yours, use any free nakshatra calculator with your birth date, time, and place. Ashwini is the first; Revati is the twenty-seventh.
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
                placeholder="What are you hoping for your family? Peace and good health for my parents / My daughter's exams / Safe move to a new city / Gratitude for this year (any language, any length - the Tantri reads this)"
                {...register("prayerIntention")}
              />
            </label>
          </>
        ) : (
          <>
            <div className="field field--full">
              <span>Gift occasion</span>
              <div className="booking-mode-grid">
                {giftOccasions.map((occasion) => (
                  <button
                    key={occasion.value}
                    type="button"
                    className={`selection-card ${selectedOccasion === occasion.value ? "selection-card--active" : ""}`}
                    onClick={() => setValue("giftOccasion", occasion.value)}
                  >
                    <span className="selection-card__eyebrow">{occasion.label}</span>
                    <strong>{occasion.note}</strong>
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span>Recipient name</span>
              <input {...register("recipientName")} />
            </label>
            <label className="field">
              <span>Recipient gothram</span>
              <input {...register("recipientGothram")} />
            </label>
            <label className="field">
              <span>Recipient nakshatra</span>
              <select {...register("recipientNakshatra")}>
                <option value="">Select a nakshatra</option>
                {nakshatras.map((nakshatra) => (
                  <option key={nakshatra} value={nakshatra}>
                    {nakshatra}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--full">
              <span>Recipient prayer intention</span>
              <textarea
                rows={5}
                placeholder="What are you hoping for their family? Peace and good health / Exam blessing / Safe travel / Gratitude for a new beginning"
                {...register("recipientPrayerIntention")}
              />
            </label>
            <label className="field">
              <span>Your name</span>
              <input {...register("senderName")} />
            </label>
            <label className="field">
              <span>Recipient email</span>
              <input type="email" {...register("recipientEmail")} />
            </label>
          </>
        )}

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
              ॐ
            </span>
            <span>Temple request received.</span>
          </div>
        ) : null}
        {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : mode === "gift" ? "Offer this puja as a gift" : "Join waitlist"}
        </Button>
      </form>
    </div>
  );
}
