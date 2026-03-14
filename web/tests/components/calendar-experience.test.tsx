import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CalendarExperience } from "../../components/content/CalendarExperience";
import type { Panchang, Prayer } from "../../lib/types";

const prayer: Prayer = {
  _id: "prayer-1",
  slug: "gayatri-mantra",
  title: { en: "Gayatri Mantra" },
  type: "MANTRA",
  difficulty: "beginner",
  durationMinutes: 3,
  content: {
    devanagari: "ॐ भूर्भुवः स्वः",
    english: "We meditate on the divine light."
  },
  deity: {
    _id: "deity-1",
    slug: "saraswati",
    name: { en: "Saraswati" }
  },
  requiredTier: "free",
  isPremium: false,
  tags: ["auspicious"]
};

const panchangDay: Panchang = {
  date: "2026-03-14",
  timezone: "Asia/Kolkata",
  tithi: {
    number: 1,
    name: "Pratipada"
  },
  nakshatra: {
    name: "Ashwini"
  },
  dailyGuidance: {
    overall: "Steady devotional guidance",
    auspiciousWindow: "Morning"
  },
  rahuKaal: {
    start: "10:30",
    end: "12:00"
  }
};

describe("CalendarExperience", () => {
  it("abbreviates long tithi labels in the month grid while preserving the full title", () => {
    render(
      <CalendarExperience
        today={panchangDay}
        upcoming={[panchangDay]}
        festivals={[]}
        prayers={[prayer]}
      />
    );

    const cellLabel = screen.getByText("Prat");
    expect(cellLabel).toBeInTheDocument();
    expect(cellLabel).toHaveAttribute("title", "Pratipada");
  });
});
