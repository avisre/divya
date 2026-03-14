import { describe, expect, it } from "vitest";
import { isPlayableMediaUrl, resolvePlayableAudioUrl } from "../../lib/media";

describe("media helpers", () => {
  it("rejects raw audio resource URLs", () => {
    expect(isPlayableMediaUrl("raw://mahishasura_mardini_stotram")).toBe(false);
  });

  it("accepts signed and relative media URLs", () => {
    expect(isPlayableMediaUrl("https://www.praarthana.com/api/prayers/123/audio/stream?sig=abc")).toBe(true);
    expect(isPlayableMediaUrl("/api/prayers/123/audio/stream?sig=abc")).toBe(true);
  });

  it("chooses the first playable candidate", () => {
    expect(
      resolvePlayableAudioUrl(
        "raw://mahishasura_mardini_stotram",
        "",
        "https://www.praarthana.com/api/prayers/123/audio/stream?sig=abc"
      )
    ).toBe("https://www.praarthana.com/api/prayers/123/audio/stream?sig=abc");
  });
});
