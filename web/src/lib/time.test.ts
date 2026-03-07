import { describe, expect, it, vi } from "vitest";
import { browserTimezone, timeGreeting } from "@/lib/time";

describe("time helpers", () => {
  it("returns a timezone string", () => {
    expect(typeof browserTimezone()).toBe("string");
    expect(browserTimezone().length).toBeGreaterThan(0);
  });

  it("returns a greeting label", () => {
    const formatterSpy = vi
      .spyOn(Intl, "DateTimeFormat")
      .mockImplementation(
        () =>
          ({
            format: () => "08"
          }) as Intl.DateTimeFormat
      );

    expect(timeGreeting("America/New_York")).toBe("Suprabhatam");
    formatterSpy.mockRestore();
  });
});
