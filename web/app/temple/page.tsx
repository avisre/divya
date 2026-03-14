import type { Metadata } from "next";
import { Hero } from "../../components/content/Hero";
import { MetricGrid } from "../../components/content/MetricGrid";
import { PujaCard } from "../../components/content/PujaCard";
import { Section } from "../../components/content/Section";
import { StructuredData } from "../../components/content/StructuredData";
import { Button } from "../../components/ui/Button";
import { getPujas, getTemple } from "../../lib/data";
import { getTempleVisual } from "../../lib/presentation";
import { buildBreadcrumbSchema, buildPublicMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Bhadra Bhagavathi Temple in Karunagapally",
  description:
    "Learn about the Bhadra Bhagavathi Temple tradition, ritual windows, and temple offerings coordinated through Prarthana.",
  path: "/temple"
});

export default async function TemplePage() {
  const [temple, pujas] = await Promise.all([
    getTemple().catch(() => null),
    getPujas("USD").catch(() => [])
  ]);

  if (!temple) {
    return <div className="page-state">Temple details are not available right now.</div>;
  }

  const templeVisual = getTempleVisual(temple);

  return (
    <div className="page-stack">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Prarthana", path: "/" },
          { name: "Temple", path: "/temple" }
        ])}
      />
      <Hero
        variant="temple"
        eyebrow="Temple"
        title={temple.name.en}
        subtitle={
          temple.fullDescription ||
          temple.shortDescription ||
          "Temple details from Karunagapally."
        }
        actions={
          <>
            <Button href="/pujas">Browse pujas</Button>
            <Button tone="secondary" href="/prayers">
              Browse prayers
            </Button>
          </>
        }
        aside={
          <div className="hero-side-stack">
            <figure className="media-frame media-frame--hero media-frame--warm">
              <img src={templeVisual.src} alt={templeVisual.alt} className="media-frame__image" />
            </figure>
            <div className="chip-cluster">
              <span className="info-chip">Karunagapally, Kerala</span>
              <span className="info-chip">{temple.tradition || "Kerala Tantric Agama"}</span>
              <span className="info-chip">{temple.panchangLocation?.timezone || "Asia/Kolkata"}</span>
            </div>
          </div>
        }
      />
      <Section
        title="Temple rhythm"
        subtitle="Why this temple matters should read like a statement of place and practice, not an inventory line."
      >
        <div className="content-grid">
          <div className="surface-card surface-card--feature mission-card">
            <h3>Why this temple matters</h3>
            <p>{temple.significance || temple.nriNote || "Temple significance details will appear here."}</p>
          </div>
          <div className="surface-card">
            <h3>Ritual windows</h3>
            <div className="ritual-table">
              {temple.timings?.pujas?.map((timing) => (
                <div
                  key={`${timing.name}-${timing.timeIST}`}
                  className={`ritual-row ${/usha/i.test(timing.name) ? "ritual-row--highlight" : ""}`}
                >
                  <span>{timing.name}</span>
                  <span>{timing.timeIST} IST</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
      <Section
        title="Temple offerings"
        subtitle="Temple offerings stay warm, human, and actionable instead of reading like a pricing table."
      >
        <div className="catalog-grid">
          {pujas.slice(0, 6).map((puja) => (
            <PujaCard key={puja._id} puja={puja} />
          ))}
        </div>
      </Section>
      <Section
        title="Temple reference"
        subtitle="The temple context stays visible even when a user enters only through a puja or prayer page."
      >
        <MetricGrid
          items={[
            { label: "Town", value: temple.location?.city || "Karunagapally" },
            { label: "Tradition", value: temple.tradition || "Temple-led" },
            { label: "Timezone", value: temple.panchangLocation?.timezone || "Asia/Kolkata" }
          ]}
        />
      </Section>
    </div>
  );
}
