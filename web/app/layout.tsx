import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Nunito } from "next/font/google";
import "@/app/globals.css";
import { SiteShell } from "@/components/shell/SiteShell";
import { SITE_URL } from "@/lib/env";
import { getOptionalSession } from "@/lib/session";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"]
});

const bodyFont = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Divya | Hindu prayer app for families abroad",
    template: "%s | Divya"
  },
  description:
    "A devotional web experience for prayers, panchang, temple waitlists, sacred videos, and family ritual coordination.",
  openGraph: {
    title: "Divya",
    description:
      "Temple connection, guided prayers, panchang, puja waitlists, and sacred videos in one secure web experience.",
    type: "website",
    url: SITE_URL
  },
  twitter: {
    card: "summary_large_image",
    title: "Divya",
    description:
      "Temple connection, guided prayers, panchang, puja waitlists, and sacred videos in one secure web experience."
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getOptionalSession();

  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <SiteShell user={session?.user || null}>{children}</SiteShell>
      </body>
    </html>
  );
}
