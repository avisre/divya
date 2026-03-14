import { describe, expect, it } from "vitest";
import { enrichPrayer } from "../../lib/prayer-enrichment";
import type { Prayer } from "../../lib/types";

function createPrayer(slug: string, title: string): Prayer {
  return {
    _id: slug,
    slug,
    title: { en: title },
    type: "prayer",
    difficulty: "beginner",
    durationMinutes: 5,
    content: {
      english: `${title} description`
    },
    deity: {
      _id: "deity-1",
      slug: "test-deity",
      name: { en: "Test Deity" }
    }
  };
}

describe("prayer enrichment", () => {
  it("creates a readable fallback verse for thin prayer records", () => {
    const enriched = enrichPrayer(createPrayer("hanuman-chalisa", "Hanuman Chalisa"));

    expect(enriched.meaning).toBe("Hanuman Chalisa description");
    expect(enriched.verses).toHaveLength(1);
    expect(enriched.verses?.[0]?.script).toBe("Hanuman Chalisa description");
    expect(enriched.content.english).toBe("Hanuman Chalisa description");
  });

  it("keeps verse count stable even when script-specific fields are absent", () => {
    const enriched = enrichPrayer(createPrayer("kerala-bhagavathi-stuti", "Kerala Bhagavathi Stuti"));

    expect(enriched.content.malayalam).toBeNull();
    expect(enriched.verses?.[0]?.script).toBe("Kerala Bhagavathi Stuti description");
    expect(enriched.verseCount).toBe(1);
  });

  it("preserves backend fields when they already exist", () => {
    const enriched = enrichPrayer({
      ...createPrayer("gayatri-mantra", "Gayatri Mantra"),
      meaning: "Existing meaning",
      content: {
        english: "Existing english",
        devanagari: "Existing devanagari"
      }
    });

    expect(enriched.meaning).toBe("Existing meaning");
    expect(enriched.content.devanagari).toBe("Existing devanagari");
  });
});
