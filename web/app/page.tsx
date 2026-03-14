import type { Metadata } from "next";
import { Hero } from "../components/content/Hero";
import { MetricGrid } from "../components/content/MetricGrid";
import { PanchangSummary } from "../components/content/PanchangSummary";
import { PrayerCard } from "../components/content/PrayerCard";
import { PujaCard } from "../components/content/PujaCard";
import { Section } from "../components/content/Section";
import { StructuredData } from "../components/content/StructuredData";
import { Button } from "../components/ui/Button";
import { getFeaturedPrayers, getPanchangToday, getPujas, getTemple } from "../lib/data";
import { getPanchangTone, getTempleVisual, OM_SYMBOL } from "../lib/presentation";
import { buildOrganizationSchema, buildPublicMetadata } from "../lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Prarthana | Hindu prayer app for families abroad",
  description:
    "Guided prayers, temple-coordinated puja waitlists, sacred recordings, and panchang-led daily rhythm for families connected to Bhadra Bhagavathi Temple.",
  path: "/"
});

export default async function LandingPage() {
  const [featuredPrayers, temple, panchang, pujas] = await Promise.all([
    getFeaturedPrayers().catch(() => []),
    getTemple().catch(() => null),
    getPanchangToday("Asia/Kolkata").catch(() => null),
    getPujas("USD").catch(() => [])
  ]);

  const templeVisual = getTempleVisual(temple);
  const panchangTone = panchang ? getPanchangTone(panchang) : "neutral";

  return (
    <div className="page-stack">
      <StructuredData data={buildOrganizationSchema()} />
      <Hero
        variant="landing"
        eyebrow="Bhadra Bhagavathi Temple - Karunagapally"
        title="A devotional home for NRI families staying close to the temple rhythm."
        subtitle="Prarthana brings together guided prayers, daily sacred timing, temple puja requests, and private recordings for families carrying Kerala temple memory across oceans."
        actions={
          <>
            <Button href="/register">Begin with Prarthana</Button>
            <Button tone="secondary" href="/login">
              Sign in
            </Button>
          </>
        }
        watermark={OM_SYMBOL}
        aside={
          <div className="hero-side-stack">
            {panchang ? (
              <div className={`surface-card hero-snippet hero-snippet--${panchangTone}`}>
                <p className="eyebrow">{"Today\u2019s panchang"}</p>
                <strong>{panchang.tithi.name}</strong>
                <span>{panchang.nakshatra.name}</span>
                <p>{panchang.dailyGuidance?.overall || "A calm day for prayer and steady ritual rhythm."}</p>
              </div>
            ) : null}
            <figure className="media-frame media-frame--hero">
              <img src={templeVisual.src} alt={templeVisual.alt} className="media-frame__image" />
            </figure>
          </div>
        }
      />

      <Section
        title="Temple trust"
        subtitle="The web experience should answer the questions families abroad actually ask before they place their faith in it."
      >
        <MetricGrid
          items={[
            { label: "Temple queue", value: "Connected", helper: "Requests stay aligned to the real temple queue" },
            { label: "Temple priest", value: "Licensed Tantri", helper: "Offerings are performed by the temple tradition" },
            { label: "Sacred video", value: "48h delivery", helper: "HD recording arrives privately to your account" },
            { label: "Family intent", value: "Name-linked", helper: "Prayers are offered in your family\u2019s name" }
          ]}
        />
      </Section>

      {panchang ? (
        <Section
          title={"Today\u2019s rhythm"}
          subtitle="Begin from the daily sacred timing before choosing a prayer or a puja."
        >
          <PanchangSummary panchang={panchang} />
        </Section>
      ) : null}

      <Section
        title="Featured prayers"
        subtitle="A focused library for households that want clarity, pronunciation support, and a calm reading experience."
      >
        <div className="catalog-grid catalog-grid--two">
          {featuredPrayers.slice(0, 2).map((prayer) => (
            <PrayerCard key={prayer._id} prayer={prayer} />
          ))}
        </div>
      </Section>

      <Section
        title="Temple offerings"
        subtitle="Waitlist-based offerings stay temple-led, with the context families need before they submit."
      >
        <div className="catalog-grid">
          {pujas.slice(0, 3).map((puja) => (
            <PujaCard key={puja._id} puja={puja} />
          ))}
        </div>
      </Section>

      <Section title="Privacy declaration" subtitle="Privacy is part of the product, not something hidden in the footer.">
        <div className="declaration-grid">
          <div className="surface-card declaration-card">
            <div className="ornament-line" aria-hidden="true" />
            <h3>Private by default</h3>
            <p>
              Sessions live in secure cookies, not browser token storage. Prayer records, offerings,
              and videos remain private to your account.
            </p>
          </div>
          <div className="surface-card declaration-card">
            <div className="ornament-line" aria-hidden="true" />
            <h3>Temple-backed continuity</h3>
            <p>
              The website and mobile app both speak to the same backend and temple workflow, so your
              family never loses the thread of a ritual once it begins.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
