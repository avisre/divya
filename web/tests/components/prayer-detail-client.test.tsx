import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrayerDetailClient } from "../../components/forms/PrayerDetailClient";
import type { Prayer } from "../../lib/types";

const guidedFlowState = {
  suppressPrompts: false
};

vi.mock("../../components/forms/PrayerAudioPlayer", () => ({
  PrayerAudioPlayer: ({
    title,
    src,
    onPlaybackChange
  }: {
    title: string;
    src: string;
    onPlaybackChange?: (isPlaying: boolean) => void;
  }) => (
    <div>
      <div data-testid="mock-prayer-audio-src">{src}</div>
      <button type="button" onClick={() => onPlaybackChange?.(true)}>
        Play {title}
      </button>
    </div>
  )
}));

vi.mock("../../components/ux/UxProvider", () => ({
  useUx: () => ({
    announceGamification: vi.fn(),
    dismissPrompt: vi.fn(),
    markPrayerOpened: vi.fn(),
    markPrayer60s: vi.fn(),
    state: {
      prayerOpenCount: 0
    }
  })
}));

vi.mock("../../components/ux/GuidedFlowProvider", () => ({
  useGuidedFlow: () => ({
    suppressPrompts: guidedFlowState.suppressPrompts
  })
}));

const prayer: Prayer = {
  _id: "prayer-1",
  slug: "lalitha-sahasranamam",
  title: { en: "Lalitha Sahasranamam" },
  type: "stotram",
  difficulty: "intermediate",
  durationMinutes: 12,
  audioUrl: "raw://lalitha_sahasranama_108",
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
  beforeEach(() => {
    window.localStorage.clear();
    guidedFlowState.suppressPrompts = false;
  });

  it("renders Devanagari content with the Sanskrit lang attribute", () => {
    render(
      <PrayerDetailClient
        prayer={prayer}
        audio={null}
        isAuthenticated={false}
        currentTier="free"
      />
    );

    const scriptPanel = document.querySelector(".reading-panel--script");

    expect(scriptPanel).toHaveAttribute("lang", "sa");
    expect(scriptPanel?.textContent).toContain("\u0936\u094d\u0930\u0940 \u092e\u093e\u0924\u093e");
  });

  it("shows the inline upgrade prompt for locked prayers", () => {
    render(
      <PrayerDetailClient
        prayer={{
          ...prayer,
          entitled: false,
          requiredTier: "bhakt"
        }}
        audio={null}
        isAuthenticated
        currentTier="free"
      />
    );

    expect(screen.getByText("This prayer is part of the Bhakt library")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Unlock with Bhakt/i })).toHaveAttribute(
      "href",
      "/plans?highlight=bhakt"
    );
  });

  it("suppresses the prayer paywall while the guided flow is active", () => {
    guidedFlowState.suppressPrompts = true;

    render(
      <PrayerDetailClient
        prayer={{
          ...prayer,
          entitled: false,
          requiredTier: "bhakt"
        }}
        audio={null}
        isAuthenticated
        currentTier="free"
      />
    );

    expect(screen.queryByTestId("prayer-paywall")).not.toBeInTheDocument();
    guidedFlowState.suppressPrompts = false;
  });

  it("resolves bundled prayer audio through the local web route", () => {
    render(
      <PrayerDetailClient
        prayer={prayer}
        audio={null}
        isAuthenticated={false}
        currentTier="free"
      />
    );

    expect(screen.getByTestId("mock-prayer-audio-src")).toHaveTextContent(
      "/api/prayer-audio/lalitha_sahasranama_108"
    );
  });

  it("switches to follow along and shows the English line when playback starts", () => {
    render(
      <PrayerDetailClient
        prayer={prayer}
        audio={null}
        isAuthenticated={false}
        currentTier="free"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Play Lalitha Sahasranamam/i }));

    expect(screen.getByText(/Roman letters stay on top for pronunciation/i)).toBeInTheDocument();
    expect(screen.getByText("Salutations to the Divine Mother.")).toBeInTheDocument();
  });
});
