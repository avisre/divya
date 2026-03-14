import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrayerDetailClient } from "../../components/forms/PrayerDetailClient";
import type { Prayer } from "../../lib/types";

vi.mock("../../components/forms/PrayerAudioPlayer", () => ({
  PrayerAudioPlayer: ({ title }: { title: string }) => <div>{title} audio</div>
}));

vi.mock("../../components/ux/UxProvider", () => ({
  useUx: () => ({
    announceGamification: vi.fn(),
    markPrayerOpened: vi.fn(),
    markPrayer60s: vi.fn(),
    state: {}
  })
}));

const prayer: Prayer = {
  _id: "prayer-1",
  slug: "lalitha-sahasranamam",
  title: { en: "Lalitha Sahasranamam" },
  type: "stotram",
  difficulty: "intermediate",
  durationMinutes: 12,
  deity: {
    _id: "deity-1",
    slug: "bhagavathi",
    name: { en: "Bhadra Bhagavathi" }
  },
  content: {
    devanagari: "\u0950 \u0936\u094d\u0930\u0940 \u092e\u093e\u0924\u093e \u0936\u094d\u0930\u0940 \u092e\u0939\u093e\u0930\u093e\u091c\u094d\u091e\u0940"
  },
  iast: "om sri mata sri maharajni",
  meaning: "Salutations to the Divine Mother."
};

describe("PrayerDetailClient", () => {
  it("renders Devanagari content with the Sanskrit lang attribute", () => {
    render(<PrayerDetailClient prayer={prayer} audio={null} isAuthenticated={false} />);

    const scriptPanel = document.querySelector(".reading-panel--script");

    expect(scriptPanel).toHaveAttribute("lang", "sa");
    expect(scriptPanel?.textContent).toContain("\u0936\u094d\u0930\u0940 \u092e\u093e\u0924\u093e");
  });
});
