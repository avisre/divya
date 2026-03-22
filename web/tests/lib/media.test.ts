import { describe, expect, it } from "vitest";
import {
  isPlayableMediaUrl,
  resolveBundledPrayerAudioUrl,
  resolvePlayableAudioUrl
} from "../../lib/media";

describe("media helpers", () => {
  it("maps bundled raw audio resources to the local prayer audio route", () => {
    expect(resolveBundledPrayerAudioUrl("raw://mahishasura_mardini_stotram")).toBe(
      "/api/prayer-audio/mahishasura_mardini_stotram"
    );
  });

  it("treats bundled raw audio resource URLs as playable once mapped", () => {
    expect(isPlayableMediaUrl("raw://mahishasura_mardini_stotram")).toBe(true);
  });

  it("accepts signed and relative media URLs", () => {
    expect(isPlayableMediaUrl("https://www.praarthana.com/api/prayers/123/audio/stream?sig=abc")).toBe(true);
    expect(isPlayableMediaUrl("/api/prayers/123/audio/stream?sig=abc")).toBe(true);
  });

  it("prefers bundled prayer audio when a raw resource is present", () => {
    expect(
      resolvePlayableAudioUrl(
        "raw://mahishasura_mardini_stotram",
        "https://www.praarthana.com/api/prayers/123/audio/stream?sig=abc"
      )
    ).toBe("/api/prayer-audio/mahishasura_mardini_stotram");
  });

  it("still prefers bundled prayer audio when the raw resource appears later in the candidate list", () => {
    expect(
      resolvePlayableAudioUrl(
        "https://www.praarthana.com/api/prayers/123/audio/stream?sig=abc",
        "raw://mahishasura_mardini_stotram"
      )
    ).toBe("/api/prayer-audio/mahishasura_mardini_stotram");
  });

  it("chooses the first playable candidate when no bundled raw resource is present", () => {
    expect(
      resolvePlayableAudioUrl(
        "",
        "",
        "https://www.praarthana.com/api/prayers/123/audio/stream?sig=abc"
      )
    ).toBe("https://www.praarthana.com/api/prayers/123/audio/stream?sig=abc");
  });
});
