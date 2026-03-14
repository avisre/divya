import type { Metadata } from "next";
import { PujasCatalogClient } from "../../components/content/PujasCatalogClient";
import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { StructuredData } from "../../components/content/StructuredData";
import { PujasPageTracker } from "../../components/ux/PujasPageTracker";
import { getPujas, getTemple } from "../../lib/data";
import { buildBreadcrumbSchema, buildPublicMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Temple pujas and sacred offerings",
  description:
    "Browse puja waitlists coordinated directly with Bhadra Bhagavathi Temple, with clear trust signals, pricing, and video delivery expectations.",
  path: "/pujas"
});

export default async function PujasPage() {
  const [pujas, temple] = await Promise.all([
    getPujas("USD").catch(() => []),
    getTemple().catch(() => null)
  ]);
  const familiesCount = pujas.reduce((count, puja) => count + Number(puja.waitlistCount || 0), 0);

  return (
    <div className="page-stack">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Prarthana", path: "/" },
          { name: "Pujas", path: "/pujas" }
        ])}
      />
      <PujasPageTracker />
      <Hero
        variant="puja"
        eyebrow="Pujas"
        title="Join sacred waitlists for temple offerings performed in your family's name."
        subtitle="Every offering stays tied to the temple queue, the Tantri-led ritual, and the private sacred record your family receives afterwards."
      />
      <div className="trust-strip trust-strip--pujas">
        <span>Temple coordinated directly with the Tantri</span>
        <span>Video delivered within 48 hours of completion</span>
        <span>Booking records stay private to your account</span>
        <span>{familiesCount} families have booked through Prarthana</span>
      </div>
      <Section
        title="Temple offerings"
        subtitle="Filter by time, price, and popularity without losing the sacred weight of the offering catalog."
      >
        <PujasCatalogClient pujas={pujas} temple={temple} currency="USD" />
      </Section>
    </div>
  );
}
