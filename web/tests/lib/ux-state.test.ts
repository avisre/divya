import { describe, expect, it } from "vitest";
import {
  consumePendingOnboarding,
  getUxStorageKey,
  markPendingOnboarding,
  readUxState,
  writeUxState
} from "../../lib/ux-state";

describe("ux state storage", () => {
  it("persists and restores ux state by user id", () => {
    writeUxState("user-1", {
      showWelcomeOverlay: true,
      prayerOpenCount: 1,
      visitedPujas: true
    });

    expect(readUxState("user-1")).toMatchObject({
      showWelcomeOverlay: true,
      prayerOpenCount: 1,
      visitedPujas: true
    });
    expect(getUxStorageKey("user-1")).toContain("user-1");
  });

  it("consumes pending onboarding only once", () => {
    markPendingOnboarding();

    expect(consumePendingOnboarding()).toBeTruthy();
    expect(consumePendingOnboarding()).toBeNull();
  });
});
