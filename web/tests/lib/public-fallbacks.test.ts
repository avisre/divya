import { describe, expect, it } from "vitest";
import {
  getFallbackDeities,
  getFallbackPrayer,
  getFallbackPrayerAudio,
  getFallbackPrayers,
  getFallbackPuja,
  getFallbackPujas,
  getFallbackTemple
} from "../../lib/public-fallbacks";

describe("public fallbacks", () => {
  it("loads the seeded prayer catalog for public fallback reads", async () => {
    const prayers = await getFallbackPrayers();

    expect(prayers.length).toBeGreaterThanOrEqual(20);
    expect(prayers.some((prayer) => prayer.slug === "kerala-bhagavathi-stuti")).toBe(true);
  });

  it("maps seeded prayers to bundled raw audio urls", async () => {
    const prayer = await getFallbackPrayer("gayatri-mantra");

    expect(prayer?.audioUrl).toBe("raw://gayatri_mantra");
    expect(prayer?.verses?.[0]?.meaning).toContain("guide");
  });

  it("builds audio metadata for bundled prayer audio fallbacks", async () => {
    const audio = await getFallbackPrayerAudio("kerala-bhagavathi-stuti");

    expect(audio?.directUrl).toBe("raw://kerala_bhagavathi_stuti");
    expect(audio?.requiredTier).toBe("free");
  });

  it("returns a temple fallback with Kerala timing context", () => {
    const temple = getFallbackTemple();

    expect(temple.name.en).toContain("Bhadra Bhagavathi Temple");
    expect(temple.panchangLocation?.timezone).toBe("Asia/Kolkata");
  });

  it("returns puja fallbacks with display prices in the requested currency", () => {
    const pujas = getFallbackPujas("GBP");
    const abhishekam = getFallbackPuja("abhishekam", "GBP");

    expect(pujas.length).toBeGreaterThanOrEqual(3);
    expect(abhishekam?.displayPrice).toEqual({
      amount: 40,
      currency: "GBP"
    });
  });

  it("derives deity options from the fallback prayer catalog", async () => {
    const deities = await getFallbackDeities();

    expect(deities.some((deity) => deity.slug === "saraswati")).toBe(true);
    expect(deities.some((deity) => deity.slug === "bhadra-bhagavathi")).toBe(true);
  });
});
