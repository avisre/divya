import { beforeEach, describe, expect, it, vi } from "vitest";

const sendJson = vi.fn();

vi.mock("../../lib/client-api", () => ({
  sendJson: (...args: unknown[]) => sendJson(...args)
}));

import { trackEvent, trackPageView } from "../../lib/analytics";

describe("analytics", () => {
  beforeEach(() => {
    sendJson.mockReset();
    sendJson.mockResolvedValue({});
    window.plausible = vi.fn();
    window.history.replaceState({}, "", "/home");
  });

  it("tracks events in Plausible and backend observability", () => {
    trackEvent("Prayer Opened", {
      prayer_slug: "gayatri-mantra",
      audio_available: true,
      ignored: undefined
    });

    expect(window.plausible).toHaveBeenCalledWith("Prayer Opened", {
      props: {
        prayer_slug: "gayatri-mantra",
        audio_available: true
      }
    });
    expect(sendJson).toHaveBeenCalledWith(
      "/api/backend/observability/events",
      expect.objectContaining({
        method: "POST",
        keepalive: true
      })
    );
  });

  it("tracks page views through Plausible", () => {
    trackPageView("/prayers/gayatri-mantra");

    expect(window.plausible).toHaveBeenCalledWith("pageview", {
      u: new URL("/prayers/gayatri-mantra", window.location.origin).toString()
    });
  });
});
