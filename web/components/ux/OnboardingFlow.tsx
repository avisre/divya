"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendJson } from "../../lib/client-api";
import { getDeityThemeStyle, getPrayerPreview } from "../../lib/presentation";
import type { Prayer } from "../../lib/types";
import { Button } from "../ui/Button";
import { StatusStrip } from "../ui/StatusStrip";
import { ClockIcon, LotusIcon } from "../ui/Icons";
import { useUx } from "./UxProvider";

const countryOptions = [
  { label: "United States", value: "US", timezone: "America/New_York" },
  { label: "United Kingdom", value: "UK", timezone: "Europe/London" },
  { label: "Canada", value: "CA", timezone: "America/Toronto" },
  { label: "United Arab Emirates", value: "UAE", timezone: "Asia/Dubai" },
  { label: "Australia", value: "AU", timezone: "Australia/Sydney" },
  { label: "India", value: "IN", timezone: "Asia/Kolkata" }
];

function formatTempleWindow(timezone: string) {
  const istDate = new Date("2026-03-14T04:30:00+05:30");
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone
  }).format(istDate);
}

function pickRecommendedPrayer(prayers: Prayer[], selectedDeities: string[]) {
  if (selectedDeities.length) {
    const matched = prayers.find((prayer) => selectedDeities.includes(prayer.deity?.slug || ""));
    if (matched) return matched;
  }

  return (
    prayers.find((prayer) => prayer.title.en.toLowerCase().includes("gayatri")) ||
    prayers.find((prayer) => prayer.isFeatured) ||
    prayers[0] ||
    null
  );
}

export function OnboardingFlow({
  prayers,
  deities,
  userName,
  defaultCountry,
  defaultTimezone
}: {
  prayers: Prayer[];
  deities: Array<{ _id: string; slug: string; name: { en: string } }>;
  userName: string;
  defaultCountry: string;
  defaultTimezone: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState(defaultCountry);
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [selectedDeities, setSelectedDeities] = useState<string[]>(["bhadra-bhagavathi"]);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const { completeOnboarding, skipOnboarding } = useUx();
  const next = searchParams.get("next") || "/home";

  const recommendedPrayer = useMemo(
    () => pickRecommendedPrayer(prayers, selectedDeities),
    [prayers, selectedDeities]
  );
  const homeLabel = userName.split(" ")[0] || userName;
  const deityCards = useMemo(() => {
    const priority = ["bhadra-bhagavathi", "ganesha", "saraswati", "shiva", "hanuman", "krishna"];
    return [...deities].sort((left, right) => {
      return priority.indexOf(left.slug) - priority.indexOf(right.slug);
    });
  }, [deities]);

  function toggleDeity(slug: string) {
    setSelectedDeities((current) =>
      current.includes(slug) ? current.filter((value) => value !== slug) : [...current, slug]
    );
  }

  async function persistProfile(selection: "pray" | "learn") {
    setPending(true);
    setStatus("");
    try {
      await sendJson("/api/backend/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          country,
          timezone,
          prayerReminders: {
            morningEnabled: remindersEnabled,
            morningTime: "07:00",
            festivalAlerts: true
          }
        })
      });

      completeOnboarding({
        selection,
        country,
        timezone,
        deitySlugs: selectedDeities
      });

      router.push(selection === "pray" && recommendedPrayer ? `/prayers/${recommendedPrayer.slug}` : next);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save your devotional preferences.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="surface-card onboarding-flow">
      <div className="surface-card__meta">
        <span className="pill pill--soft">Step {step + 1} of 3</span>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            skipOnboarding();
            router.push("/home");
          }}
        >
          Skip for now
        </button>
      </div>

      {step === 0 ? (
        <div className="onboarding-flow__step">
          <div className="onboarding-flow__intro">
            <p className="eyebrow">Your timezone</p>
            <h2>Where is your family based, {homeLabel}?</h2>
            <p>
              We use this to place Kerala ritual windows into your local time so the temple rhythm
              feels relevant where you live.
            </p>
          </div>
          <label className="field">
            <span>Country</span>
            <select
              value={country}
              onChange={(event) => {
                const option = countryOptions.find((entry) => entry.value === event.target.value);
                setCountry(event.target.value);
                if (option) setTimezone(option.timezone);
              }}
            >
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Timezone</span>
            <input value={timezone} onChange={(event) => setTimezone(event.target.value)} />
          </label>
          <div className="onboarding-flow__timing">
            <ClockIcon className="onboarding-flow__timing-icon" />
            <div>
              <strong>Usha Puja is at {formatTempleWindow(timezone)} your time.</strong>
              <p>The temple opens before dawn in Kerala. Prarthana keeps that sacred timing legible abroad.</p>
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="onboarding-flow__step">
          <div className="onboarding-flow__intro">
            <p className="eyebrow">Your home deity</p>
            <h2>Choose the deities you want to keep closest.</h2>
            <p>
              This shapes prayer recommendations and the learning paths surfaced first. Bhadra Bhagavathi
              stays highlighted because the app is anchored to the temple.
            </p>
          </div>
          <div className="onboarding-flow__deities">
            {deityCards.slice(0, 6).map((deity) => (
              <button
                key={deity._id}
                type="button"
                className={`selection-card ${selectedDeities.includes(deity.slug) ? "selection-card--active" : ""}`}
                style={getDeityThemeStyle(deity.name.en)}
                onClick={() => toggleDeity(deity.slug)}
              >
                <span className="selection-card__eyebrow">{deity.slug === "bhadra-bhagavathi" ? "Temple deity" : "Deity"}</span>
                <strong>{deity.name.en}</strong>
                <span>{selectedDeities.includes(deity.slug) ? "Selected for recommendations" : "Tap to add"}</span>
              </button>
            ))}
          </div>
          <label className="onboarding-flow__toggle">
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(event) => setRemindersEnabled(event.target.checked)}
            />
            <span>Enable gentle morning reminders tied to your timezone.</span>
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="onboarding-flow__step">
          <div className="onboarding-flow__intro">
            <p className="eyebrow">First practice</p>
            <h2>Begin with one prayer today.</h2>
            <p>Start with a single devotional action before you explore the full library.</p>
          </div>
          {recommendedPrayer ? (
            <article className="surface-card onboarding-prayer-card">
              <div className="surface-card__meta">
                <span className="pill pill--soft">{recommendedPrayer.type}</span>
                <span className="muted">{recommendedPrayer.durationMinutes} min</span>
              </div>
              <h3>{recommendedPrayer.title.en}</h3>
              <p>{getPrayerPreview(recommendedPrayer)}</p>
              {recommendedPrayer.deity?.name?.en ? (
                <div className="onboarding-prayer-card__deity">
                  <LotusIcon className="onboarding-prayer-card__icon" />
                  <span>{recommendedPrayer.deity.name.en}</span>
                </div>
              ) : null}
            </article>
          ) : null}
        </div>
      ) : null}

      {status ? <StatusStrip tone="warning">{status}</StatusStrip> : null}

      <div className="card-actions">
        {step > 0 ? (
          <Button type="button" tone="secondary" onClick={() => setStep((current) => current - 1)}>
            Back
          </Button>
        ) : null}
        {step < 2 ? (
          <Button type="button" onClick={() => setStep((current) => current + 1)}>
            Continue
          </Button>
        ) : (
          <>
            <Button type="button" disabled={pending} onClick={() => void persistProfile("pray")}>
              {pending ? "Saving..." : "Open prayer now"}
            </Button>
            <Button type="button" tone="secondary" disabled={pending} onClick={() => void persistProfile("learn")}>
              Explore the library
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
