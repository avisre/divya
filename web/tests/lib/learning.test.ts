import { describe, expect, it } from "vitest";
import { buildFallbackLearningPath } from "../../lib/learning";
import type { Prayer } from "../../lib/types";

const prayers: Prayer[] = [
  {
    _id: "prayer-1",
    slug: "mahishasura-mardini",
    title: { en: "Mahishasura Mardini Stotram" },
    type: "stotram",
    difficulty: "intermediate",
    durationMinutes: 12,
    deity: {
      _id: "deity-bhagavathi",
      slug: "bhadra-bhagavathi",
      name: { en: "Bhadra Bhagavathi" }
    },
    content: {}
  },
  {
    _id: "prayer-2",
    slug: "navarna-mantra",
    title: { en: "Navarna Mantra" },
    type: "mantra",
    difficulty: "intermediate",
    durationMinutes: 6,
    deity: {
      _id: "deity-bhagavathi",
      slug: "bhadra-bhagavathi",
      name: { en: "Bhadra Bhagavathi" }
    },
    content: {}
  },
  {
    _id: "prayer-3",
    slug: "hanuman-chalisa",
    title: { en: "Hanuman Chalisa" },
    type: "chalisa",
    difficulty: "beginner",
    durationMinutes: 10,
    deity: {
      _id: "deity-hanuman",
      slug: "hanuman",
      name: { en: "Hanuman" }
    },
    content: {}
  }
];

describe("learning fallback", () => {
  it("builds a Bhagavathi path from existing prayer data", () => {
    const path = buildFallbackLearningPath("bhadra-bhagavathi", prayers);

    expect(path).not.toBeNull();
    expect(path?.deity.name.en).toBe("Bhadra Bhagavathi");
    expect(path?.modules.length).toBeGreaterThanOrEqual(3);
    expect(path?.modules[0]?.linkedPrayer?.slug).toMatch(/mahishasura|navarna/);
  });

  it("creates relevant fallback content for deities without seeded backend paths", () => {
    const path = buildFallbackLearningPath("hanuman", prayers);

    expect(path).not.toBeNull();
    expect(path?.modules.some((module) => /Hanuman/i.test(module.title))).toBe(true);
    expect(path?.modules.every((module) => module.linkedPrayer?.slug === "hanuman-chalisa")).toBe(true);
  });
});
