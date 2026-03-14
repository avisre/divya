"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPrayerPreview } from "../../lib/presentation";
import type { Prayer } from "../../lib/types";
import { PrayerCard } from "./PrayerCard";
import { SearchIcon } from "../ui/Icons";

const typeFilters = ["all", "stotram", "mantra", "aarti", "chalisa", "prayer"] as const;
const durationFilters = ["all", "short", "medium", "long"] as const;

function matchesDuration(prayer: Prayer, duration: (typeof durationFilters)[number]) {
  if (duration === "short") return prayer.durationMinutes < 5;
  if (duration === "medium") return prayer.durationMinutes >= 5 && prayer.durationMinutes <= 10;
  if (duration === "long") return prayer.durationMinutes > 10;
  return true;
}

function matchesContext(prayer: Prayer, context: string | null) {
  if (!context) return true;
  const haystack = `${prayer.title.en} ${prayer.deity?.name?.en || ""} ${(prayer.tags || []).join(" ")}`.toLowerCase();

  if (context === "inauspicious") {
    return /(shiva|mahamrityunjaya|ancestor|pitru|narayana)/.test(haystack);
  }

  if (context === "auspicious") {
    return /(bhagavathi|devi|ganesha|lakshmi|gayatri|saraswati)/.test(haystack);
  }

  return true;
}

export function PrayerLibraryClient({
  prayers,
  deityOptions
}: {
  prayers: Prayer[];
  deityOptions: string[];
}) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [type, setType] = useState<(typeof typeFilters)[number]>("all");
  const [deity, setDeity] = useState(searchParams.get("deity") || "all");
  const [duration, setDuration] = useState<(typeof durationFilters)[number]>("all");
  const [freeOnly, setFreeOnly] = useState(searchParams.get("freeOnly") === "true");
  const context = searchParams.get("context");

  const filteredPrayers = useMemo(() => {
    return prayers.filter((prayer) => {
      const preview = getPrayerPreview(prayer).toLowerCase();
      const haystack = `${prayer.title.en} ${preview}`.toLowerCase();
      const deityName = prayer.deity?.name?.en || "";
      const isFree = (prayer.requiredTier || "free") === "free" && !prayer.isPremium;

      return (
        (!search.trim() || haystack.includes(search.trim().toLowerCase())) &&
        (type === "all" || prayer.type.toLowerCase() === type) &&
        (deity === "all" || deityName.toLowerCase() === deity.toLowerCase()) &&
        matchesDuration(prayer, duration) &&
        (!freeOnly || isFree) &&
        matchesContext(prayer, context)
      );
    });
  }, [context, deity, duration, freeOnly, prayers, search, type]);

  return (
    <div className="page-stack">
      <div className="surface-card catalog-filter-bar catalog-filter-bar--sticky">
        <label className="catalog-filter-search">
          <SearchIcon className="catalog-filter-search__icon" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search prayers..."
            aria-label="Search prayers"
          />
        </label>
        <div className="catalog-filter-row" aria-label="Prayer type filters">
          {typeFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-pill ${type === filter ? "filter-pill--active" : ""}`}
              onClick={() => setType(filter)}
            >
              {filter === "all" ? "All" : filter.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="catalog-filter-row" aria-label="Deity filters">
          <button
            type="button"
            className={`filter-pill ${deity === "all" ? "filter-pill--active" : ""}`}
            onClick={() => setDeity("all")}
          >
            All deities
          </button>
          {deityOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`filter-pill ${deity === option ? "filter-pill--active" : ""}`}
              onClick={() => setDeity(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="catalog-filter-footer">
          <div className="catalog-filter-row" aria-label="Duration filters">
            <button
              type="button"
              className={`filter-pill ${duration === "short" ? "filter-pill--active" : ""}`}
              onClick={() => setDuration("short")}
            >
              {"< 5 min"}
            </button>
            <button
              type="button"
              className={`filter-pill ${duration === "medium" ? "filter-pill--active" : ""}`}
              onClick={() => setDuration("medium")}
            >
              5-10 min
            </button>
            <button
              type="button"
              className={`filter-pill ${duration === "long" ? "filter-pill--active" : ""}`}
              onClick={() => setDuration("long")}
            >
              10+ min
            </button>
            <button
              type="button"
              className={`filter-pill ${duration === "all" ? "filter-pill--active" : ""}`}
              onClick={() => setDuration("all")}
            >
              Any length
            </button>
          </div>
          <label className="catalog-checkbox">
            <input type="checkbox" checked={freeOnly} onChange={(event) => setFreeOnly(event.target.checked)} />
            <span>Free only</span>
          </label>
        </div>
      </div>

      <div className="surface-card catalog-results">
        <strong>{filteredPrayers.length} prayers</strong>
        <span className="muted">Filtered by type, deity, duration, and devotional access.</span>
      </div>

      <div className="catalog-grid catalog-grid--two prayer-library-grid">
        {filteredPrayers.map((prayer) => (
          <PrayerCard key={prayer._id} prayer={prayer} />
        ))}
      </div>
    </div>
  );
}
