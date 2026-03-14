import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrayerCard } from "../../components/content/PrayerCard";
import type { Prayer } from "../../lib/types";

const prayer: Prayer = {
  _id: "prayer-1",
  slug: "gayatri-mantra",
  title: { en: "Gayatri Mantra" },
  type: "mantra",
  difficulty: "beginner",
  durationMinutes: 3,
  deity: {
    _id: "deity-1",
    slug: "surya",
    name: { en: "Surya" }
  },
  content: {
    devanagari: "\u0950 \u092d\u0942\u0930\u094d \u092d\u0941\u0935\u0903 \u0938\u094d\u0935\u0903"
  },
  meaning: "A daily prayer for clarity and light.",
  audioUrl: "https://cdn.divya.app/audio/gayatri.mp3",
  requiredTier: "free"
};

describe("PrayerCard", () => {
  it("preserves the pray-with-family entry point", () => {
    render(<PrayerCard prayer={prayer} />);

    expect(screen.getByRole("link", { name: /Pray with family/i })).toHaveAttribute(
      "href",
      "/sessions/create?prayer=prayer-1"
    );
    expect(screen.getByText("Audio available")).toBeInTheDocument();
  });
});
