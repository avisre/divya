import { describe, expect, it } from "vitest";
import { learnEntries } from "../../lib/learn-content";
import {
  canViewLearnEntry,
  getFeaturedLearnEntries,
  getLearnEntries,
  getLearnEntriesByCategory,
  getLearnEntry,
  getLearnFestivalEntry,
  getLearnPrayerEntry,
  getLearnPreviewWordCount,
  getLearnPujaEntry,
  learnCategories
} from "../../lib/learn";

describe("learn content integrity", () => {
  it("includes all 32 seeded entries", () => {
    expect(learnEntries).toHaveLength(32);
    expect(getLearnEntries()).toHaveLength(32);
  });

  it("keeps slugs unique and required fields populated", () => {
    const slugs = learnEntries.map((entry) => entry.slug);

    expect(new Set(slugs).size).toBe(learnEntries.length);

    for (const entry of learnEntries) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.subtitle.length).toBeGreaterThan(0);
      expect(entry.bodyMd.length).toBeGreaterThan(100);
      expect(entry.connectToPractice.length).toBeGreaterThan(20);
      expect(entry.readingTimeMinutes).toBeGreaterThan(0);
    }
  });

  it("covers all five learn categories", () => {
    expect(learnCategories).toHaveLength(5);

    for (const category of learnCategories) {
      expect(getLearnEntriesByCategory(category).length).toBeGreaterThan(0);
    }
  });

  it("marks exactly three entries as featured", () => {
    expect(learnEntries.filter((entry) => entry.isFeatured)).toHaveLength(3);
    expect(getFeaturedLearnEntries()).toHaveLength(3);
  });

  it("keeps related prayer, puja, and entry references within the supported content graph", () => {
    const validPrayerSlugs = new Set([
      "durga-chalisa",
      "ganesh-aarti",
      "gayatri-mantra",
      "hanuman-chalisa",
      "krishna-aarti",
      "lakshmi-aarti",
      "maha-mrityunjaya",
      "mahishasura-mardini",
      "om-namah-shivaya",
      "saraswati-vandana",
      "shiva-panchakshara",
      "vishnu-sahasranama-108"
    ]);
    const validPujaIds = new Set(["abhishekam", "sahasranama-archana", "kalasha-puja"]);
    const validEntryIds = new Set(learnEntries.map((entry) => entry.id));

    for (const entry of learnEntries) {
      for (const prayerSlug of entry.relatedPrayerSlugs) {
        expect(validPrayerSlugs.has(prayerSlug)).toBe(true);
      }

      for (const pujaId of entry.relatedPujaIds) {
        expect(validPujaIds.has(pujaId)).toBe(true);
      }

      for (const relatedEntryId of entry.relatedEntryIds) {
        expect(validEntryIds.has(relatedEntryId)).toBe(true);
      }
    }
  });
});

describe("learn helper mapping", () => {
  it("maps prayer slugs to the expected deity/context entries", () => {
    expect(
      getLearnPrayerEntry({
        slug: "gayatri-mantra",
        deity: { slug: "surya" }
      } as any)?.slug
    ).toBe("saraswati");

    expect(
      getLearnPrayerEntry({
        slug: "mahishasura-mardini",
        deity: { slug: "bhadra-bhagavathi" }
      } as any)?.slug
    ).toBe("bhadra-bhagavathi");
  });

  it("maps pujas to the expected Learn entries", () => {
    expect(
      getLearnPujaEntry({
        slug: "abhishekam",
        name: { en: "Abhishekam" }
      } as any)?.slug
    ).toBe("customs-abhishekam");

    expect(
      getLearnPujaEntry({
        slug: "sahasranama-archana",
        name: { en: "Sahasranama Archana" }
      } as any)?.slug
    ).toBe("customs-puja-explained");

    expect(
      getLearnPujaEntry({
        slug: "kalasha-puja",
        name: { en: "Kalasha Puja" }
      } as any)?.slug
    ).toBe("customs-puja-explained");
  });

  it("maps festival names and slugs to the corresponding Learn entries", () => {
    expect(getLearnFestivalEntry("navaratri")?.slug).toBe("festivals-navaratri");
    expect(getLearnFestivalEntry("Navaratri")?.slug).toBe("festivals-navaratri");
    expect(getLearnFestivalEntry("Diwali")?.slug).toBe("festivals-diwali");
  });

  it("shows only a 100-word preview for bhakt entries to free viewers", () => {
    const entry = getLearnEntry("murugan");

    expect(entry).not.toBeNull();
    expect(entry?.tier).toBe("bhakt");
    expect(getLearnPreviewWordCount(entry!, 100)).toBeLessThanOrEqual(100);
    expect(canViewLearnEntry(entry!, "free")).toBe(false);
    expect(canViewLearnEntry(entry!, "bhakt")).toBe(true);
    expect(canViewLearnEntry(entry!, "seva")).toBe(true);
  });
});
