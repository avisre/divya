import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DM_Sans, EB_Garamond, Noto_Serif_Devanagari, Noto_Serif_Malayalam } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "../components/analytics/GoogleAnalytics";
import { SiteShell } from "../components/shell/SiteShell";
import { SITE_URL } from "../lib/env";
import { getOptionalSession } from "../lib/session";

const displayFont = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap"
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
  display: "swap"
});

const devanagariFont = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  weight: ["400", "500"],
  display: "swap"
});

const malayalamFont = Noto_Serif_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-malayalam",
  weight: ["400", "500"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Prarthana | Hindu prayer app for families abroad",
    template: "%s | Prarthana"
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }]
  },
  description:
    "A devotional web experience for prayers, panchang, temple waitlists, sacred videos, and family ritual coordination.",
  openGraph: {
    title: "Prarthana",
    description:
      "Temple connection, guided prayers, panchang, puja waitlists, and sacred videos in one secure web experience.",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prarthana devotional platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Prarthana",
    description:
      "Temple connection, guided prayers, panchang, puja waitlists, and sacred videos in one secure web experience.",
    images: ["/og-image.png"]
  }
};

export const viewport: Viewport = {
  themeColor: "#C1440E"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getOptionalSession();

  return (
    <html lang="en">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${devanagariFont.variable} ${malayalamFont.variable}`}
      >
        <GoogleAnalytics />
        <SiteShell user={session?.user || null}>{children}</SiteShell>
      </body>
    </html>
  );
}
