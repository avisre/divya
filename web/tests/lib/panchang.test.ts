import { describe, expect, it } from "vitest";
import { buildVisibleCalendarWindow, enumerateIsoDates } from "../../lib/panchang";

describe("panchang helpers", () => {
  it("builds a visible calendar window from the first day of the month through the configured months", () => {
    const window = buildVisibleCalendarWindow("2026-03-14");

    expect(window).toEqual({
      startIso: "2026-03-01",
      endIso: "2026-05-31"
    });
  });

  it("enumerates every ISO date in a range inclusively", () => {
    expect(enumerateIsoDates("2026-03-01", "2026-03-04")).toEqual([
      "2026-03-01",
      "2026-03-02",
      "2026-03-03",
      "2026-03-04"
    ]);
  });
});
