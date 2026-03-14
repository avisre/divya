"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "../../lib/format";
import { getTempleVisual } from "../../lib/presentation";
import type { Puja, Temple } from "../../lib/types";
import { Button } from "../ui/Button";
import { PujaCard } from "./PujaCard";

const durationFilters = ["all", "short", "medium", "long"] as const;
const priceFilters = ["all", "under-50", "50-100", "100-plus"] as const;
const sortOptions = ["popular", "price", "duration"] as const;

function matchesDuration(puja: Puja, duration: (typeof durationFilters)[number]) {
  if (duration === "short") return (puja.duration || 0) < 45;
  if (duration === "medium") return (puja.duration || 0) >= 45 && (puja.duration || 0) <= 90;
  if (duration === "long") return (puja.duration || 0) > 90;
  return true;
}

function matchesPrice(puja: Puja, price: (typeof priceFilters)[number]) {
  const amount = puja.displayPrice?.amount || 0;
  if (price === "under-50") return amount < 50;
  if (price === "50-100") return amount >= 50 && amount <= 100;
  if (price === "100-plus") return amount > 100;
  return true;
}

export function PujasCatalogClient({
  pujas,
  temple,
  currency
}: {
  pujas: Puja[];
  temple: Temple | null;
  currency: string;
}) {
  const [duration, setDuration] = useState<(typeof durationFilters)[number]>("all");
  const [price, setPrice] = useState<(typeof priceFilters)[number]>("all");
  const [sort, setSort] = useState<(typeof sortOptions)[number]>("popular");

  const filteredPujas = useMemo(() => {
    const next = pujas.filter((puja) => matchesDuration(puja, duration) && matchesPrice(puja, price));

    next.sort((left, right) => {
      if (sort === "price") {
        return (left.displayPrice?.amount || 0) - (right.displayPrice?.amount || 0);
      }
      if (sort === "duration") {
        return (left.duration || 0) - (right.duration || 0);
      }
      return (right.waitlistCount || 0) - (left.waitlistCount || 0);
    });

    return next;
  }, [duration, price, pujas, sort]);

  const [featured, ...remaining] = filteredPujas;
  const heroVisual = getTempleVisual(featured?.temple || temple);

  return (
    <div className="page-stack">
      <div className="surface-card catalog-filter-bar">
        <div className="catalog-filter-footer">
          <div className="catalog-filter-row" aria-label="Puja duration filters">
            <button type="button" className={`filter-pill ${duration === "all" ? "filter-pill--active" : ""}`} onClick={() => setDuration("all")}>
              All durations
            </button>
            <button type="button" className={`filter-pill ${duration === "short" ? "filter-pill--active" : ""}`} onClick={() => setDuration("short")}>
              {"< 45 min"}
            </button>
            <button type="button" className={`filter-pill ${duration === "medium" ? "filter-pill--active" : ""}`} onClick={() => setDuration("medium")}>
              45-90 min
            </button>
            <button type="button" className={`filter-pill ${duration === "long" ? "filter-pill--active" : ""}`} onClick={() => setDuration("long")}>
              90+ min
            </button>
          </div>
          <div className="catalog-filter-row" aria-label="Puja price filters">
            <button type="button" className={`filter-pill ${price === "all" ? "filter-pill--active" : ""}`} onClick={() => setPrice("all")}>
              All prices
            </button>
            <button type="button" className={`filter-pill ${price === "under-50" ? "filter-pill--active" : ""}`} onClick={() => setPrice("under-50")}>
              Under $50
            </button>
            <button type="button" className={`filter-pill ${price === "50-100" ? "filter-pill--active" : ""}`} onClick={() => setPrice("50-100")}>
              $50-$100
            </button>
            <button type="button" className={`filter-pill ${price === "100-plus" ? "filter-pill--active" : ""}`} onClick={() => setPrice("100-plus")}>
              $100+
            </button>
          </div>
          <label className="field catalog-filter-select">
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as (typeof sortOptions)[number])}>
              <option value="popular">Most popular</option>
              <option value="price">Price low-high</option>
              <option value="duration">Duration short-long</option>
            </select>
          </label>
        </div>
      </div>

      {featured ? (
        <div className="surface-card featured-puja">
          <figure className="media-frame media-frame--featured">
            <img src={heroVisual.src} alt={heroVisual.alt} className="media-frame__image" />
          </figure>
          <div className="featured-puja__content">
            <span className="pill pill--soft">Featured offering</span>
            <h3>{featured.name.en}</h3>
            <p>{featured.description?.nriNote || featured.description?.full || featured.description?.short}</p>
            <div className="price-line featured-puja__price">
              <strong>{formatPrice(featured.displayPrice?.amount, featured.displayPrice?.currency || currency)}</strong>
              <span>{featured.duration || 0} min</span>
            </div>
            <p className="muted">{featured.waitlistCount || 0} families have booked this offering.</p>
            <div className="card-actions">
              <Button href={`/pujas/${featured._id}`}>View puja</Button>
              <Button tone="secondary" href="/temple">
                Temple overview
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="catalog-grid catalog-grid--three puja-library-grid">
        {remaining.map((puja) => (
          <PujaCard key={puja._id} puja={puja} currency={currency} />
        ))}
      </div>
    </div>
  );
}
