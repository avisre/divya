"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { sendJson } from "../../lib/client-api";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";
import type { Puja } from "../../lib/types";

type BookingValues = {
  devoteeName: string;
  gothram: string;
  nakshatra: string;
  prayerIntention: string;
  surnameCommunity: string;
  familyRegion: string;
  knownFamilyGothram: string;
};

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
  const { register, handleSubmit, getValues, setValue } = useForm<BookingValues>({
    defaultValues: {
      devoteeName: "",
      gothram: "",
      nakshatra: "",
      prayerIntention: "",
      surnameCommunity: "",
      familyRegion: "",
      knownFamilyGothram: ""
    }
  });

  const quickReasons = useMemo(() => puja.bestFor?.slice(0, 3) || [], [puja.bestFor]);

  if (!isAuthenticated) {
    return (
      <div className="surface-card">
        <h3>Sign in to join the temple waitlist</h3>
        <p>Email sign-in and Google sign-in are available on the web app. Your request stays private to your account.</p>
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
    <div className="surface-card">
      <div className="chip-toggle-row">
        <button
          type="button"
          className={`chip-toggle ${mode === "self" ? "chip-toggle--active" : ""}`}
          onClick={() => setMode("self")}
        >
          Join waitlist
        </button>
        <button
          type="button"
          className={`chip-toggle ${mode === "gift" ? "chip-toggle--active" : ""}`}
          onClick={() => setMode("gift")}
        >
          Gift this puja
        </button>
      </div>
      <form
        className="form-grid"
        onSubmit={handleSubmit(async (values) => {
          setPending(true);
          setStatus("");
          try {
            if (mode === "gift") {
              await sendJson("/api/backend/bookings/gift", {
                method: "POST",
                body: JSON.stringify({
                  pujaId: puja._id,
                  devoteeName: values.devoteeName,
                  gothram: values.gothram,
                  nakshatra: values.nakshatra,
                  prayerIntention: values.prayerIntention,
                  giftDetails: {
                    isGift: true,
                    recipientName: values.devoteeName,
                    personalMessage: `A sacred offering through ${puja.name.en}.`
                  }
                })
              });
              setStatus("Gift booking request submitted.");
            } else {
              await sendJson("/api/backend/bookings", {
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
              setStatus("Puja request submitted.");
            }
          } catch (error) {
            setStatus(error instanceof Error ? error.message : "Unable to submit your request.");
          } finally {
            setPending(false);
          }
        })}
      >
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
          <span>Gothram</span>
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
          <span>Nakshatra</span>
          <input {...register("nakshatra")} />
        </label>
        <label className="field field--full">
          <span>Prayer intention</span>
          <textarea rows={6} {...register("prayerIntention")} />
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
        {status ? <StatusStrip tone="success">{status}</StatusStrip> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : mode === "gift" ? "Submit gift request" : "Join waitlist"}
        </Button>
      </form>
    </div>
  );
}
