import { beforeEach, describe, expect, it, vi } from "vitest";

const sendJson = vi.fn();

vi.mock("../../lib/client-api", () => ({
  sendJson: (...args: unknown[]) => sendJson(...args)
}));

import { GA_MEASUREMENT_ID, trackEvent, trackPageView } from "../../lib/analytics";

describe("analytics", () => {
  beforeEach(() => {
    sendJson.mockReset();
    sendJson.mockResolvedValue({});
    window.gtag = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "http://localhost:3000/home"
      }
    });
    Object.defineProperty(document, "title", {
      configurable: true,
      value: "Home | Prarthana"
    });
  });

  it("tracks events in both GA and backend observability", async () => {
    trackEvent("prayer_opened", {
      prayer_slug: "gayatri-mantra",
      audio_available: true,
      ignored: undefined
    });

    expect(window.gtag).toHaveBeenCalledWith("event", "prayer_opened", {
      prayer_slug: "gayatri-mantra",
      audio_available: true
    });
    expect(sendJson).toHaveBeenCalledWith(
      "/api/backend/observability/events",
      expect.objectContaining({
        method: "POST",
        keepalive: true
      })
    );
  });

  it("tracks page views through gtag config", () => {
    trackPageView("/prayers/gayatri-mantra");

    expect(window.gtag).toHaveBeenCalledWith("config", GA_MEASUREMENT_ID, {
      page_path: "/prayers/gayatri-mantra",
      page_location: "http://localhost:3000/home",
      page_title: "Home | Prarthana"
    });
  });
});
