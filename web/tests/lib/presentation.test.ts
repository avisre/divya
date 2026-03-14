import { describe, expect, it } from "vitest";
import {
  OM_SYMBOL,
  TEMPLE_FALLBACK_IMAGE,
  getBookingProgressState,
  getPujaBenefitCards,
  getTempleVisual
} from "../../lib/presentation";
import type { Puja, PujaBooking, Temple } from "../../lib/types";

function createTemple(overrides: Partial<Temple> = {}): Temple {
  return {
    _id: "temple-1",
    name: { en: "Bhadra Bhagavathi Temple" },
    ...overrides
  };
}

function createPuja(overrides: Partial<Puja> = {}): Puja {
  return {
    _id: "puja-1",
    name: { en: "Abhishekam" },
    type: "Temple offering",
    benefits: ["Health blessings", "Obstacle removal", "Mental steadiness", "Grace in transitions"],
    ...overrides
  };
}

function createBooking(overrides: Partial<PujaBooking> = {}): PujaBooking {
  return {
    _id: "booking-1",
    bookingReference: "DIVYA-001",
    status: "waitlisted",
    devoteeName: "Anita",
    createdAt: "2026-03-13T00:00:00.000Z",
    ...overrides
  };
}

describe("presentation helpers", () => {
  it("uses the Devanagari OM symbol", () => {
    expect(OM_SYMBOL).toBe("\u0950");
  });

  it("falls back when the temple image is from a banned stock source", () => {
    const visual = getTempleVisual(
      createTemple({ heroImage: "https://images.unsplash.com/photo-unsafe" })
    );

    expect(visual.isFallback).toBe(true);
    expect(visual.src).toBe(TEMPLE_FALLBACK_IMAGE);
    expect(visual.alt).toContain("Bhadra Bhagavathi Temple");
  });

  it("keeps an approved temple image when available", () => {
    const visual = getTempleVisual(
      createTemple({ heroImage: "https://cdn.divya.app/temple/bhadra-bhagavathi.webp" })
    );

    expect(visual.isFallback).toBe(false);
    expect(visual.src).toContain("bhadra-bhagavathi.webp");
  });

  it("returns four unique puja benefit cards", () => {
    const cards = getPujaBenefitCards(createPuja());
    const descriptions = cards.map((card) => card.description);

    expect(cards).toHaveLength(4);
    expect(new Set(descriptions).size).toBe(4);
    expect(descriptions.join(" ")).not.toContain("lorem");
  });

  it("derives booking progress states across recording lifecycle", () => {
    expect(getBookingProgressState(createBooking()).label).toBe("Pending in temple queue");
    expect(
      getBookingProgressState(createBooking({ status: "confirmed" })).label
    ).toBe("Confirmed with temple");
    expect(
      getBookingProgressState(createBooking({ status: "completed" })).label
    ).toBe("Recording coming");
    expect(
      getBookingProgressState(createBooking({ status: "video_ready" })).label
    ).toBe("Recording available");
    expect(
      getBookingProgressState(createBooking({ status: "video_ready", videoWatchCount: 1 })).label
    ).toBe("Watched");
  });
});
