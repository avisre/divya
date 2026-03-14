import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  EB_Garamond: () => ({ variable: "--font-display" }),
  DM_Sans: () => ({ variable: "--font-body" }),
  Noto_Serif_Devanagari: () => ({ variable: "--font-devanagari" }),
  Noto_Serif_Malayalam: () => ({ variable: "--font-malayalam" })
}));

describe("root layout metadata", () => {
  it("declares brand icons, theme color, and open graph image", async () => {
    const { metadata, viewport } = await import("../../app/layout");

    expect(metadata.icons).toMatchObject({
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      shortcut: ["/favicon.svg"],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }]
    });
    expect(viewport).toMatchObject({ themeColor: "#C1440E" });
    expect(metadata.openGraph).toMatchObject({
      images: [{ url: "/og-image.png", width: 1200, height: 630 }]
    });
  });
});
