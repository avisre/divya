import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "../components/content/Hero";
import { MetricGrid } from "../components/content/MetricGrid";
import { PanchangSummary } from "../components/content/PanchangSummary";
import { PrayerCard } from "../components/content/PrayerCard";
import { PujaCard } from "../components/content/PujaCard";
import { Section } from "../components/content/Section";
import { StructuredData } from "../components/content/StructuredData";
import { Button } from "../components/ui/Button";
import { getFeaturedPrayers, getPanchangToday, getPujas, getTemple } from "../lib/data";
import { DEFAULT_DISPLAY_CURRENCY } from "../lib/format";
import { getPanchangTone, getTempleVisual, OM_SYMBOL } from "../lib/presentation";
import { buildOrganizationSchema, buildPublicMetadata } from "../lib/seo";
import { getOptionalSession } from "../lib/session";
import { buildStaticBillingCatalog, formatBillingPrice, getBillingPrice } from "../lib/subscription-plans";

const howItWorksSteps = [
  {
    title: "Choose a prayer or puja",
    body: "Browse the prayer library or select a temple offering. Pick the occasion - a birthday, festival, or monthly observance."
  },
  {
    title: "The temple performs it in your name",
    body: "Your request joins the real temple queue. A licensed Tantri performs the offering with your family name spoken aloud."
  },
  {
    title: "Receive your private sacred video",
    body: "An HD recording of the ceremony arrives in your account within 48 hours. Yours to keep and share with family."
  }
] as const;

const occasionCards = [
  { label: "Upcoming festival", href: "/pujas?occasion=festival", icon: "Festival" },
  { label: "Birthday or anniversary", href: "/pujas?occasion=life-event", icon: "Milestone" },
  { label: "Monthly observance", href: "/pujas?occasion=monthly", icon: "Monthly" },
  { label: "Daily prayer habit", href: "/prayers", icon: "Daily" },
  { label: "Gift a puja", href: "/pujas", icon: "Gift" },
  { label: "Just exploring", href: "/prayers", icon: "Explore" }
] as const;

export const metadata: Metadata = buildPublicMetadata({
  title: "Prarthana | Hindu prayer app for families abroad",
  description:
    "Guided prayers, temple-coordinated puja waitlists, sacred recordings, and panchang-led daily rhythm for families connected to Bhadra Bhagavathi Temple.",
  path: "/"
});

export default async function LandingPage() {
  const [session, featuredPrayers, temple, panchang, pujas] = await Promise.all([
    getOptionalSession(),
    getFeaturedPrayers().catch(() => []),
    getTemple().catch(() => null),
    getPanchangToday("Asia/Kolkata").catch(() => null),
    getPujas(DEFAULT_DISPLAY_CURRENCY).catch(() => [])
  ]);

  const templeVisual = getTempleVisual(temple);
  const panchangTone = panchang ? getPanchangTone(panchang) : "neutral";
  const planPreview = buildStaticBillingCatalog().plans;

  return (
    <div className="page-stack">
      <StructuredData data={buildOrganizationSchema()} />
      <Hero
        dataTestId="hero-section"
        variant="landing"
        eyebrow="Bhadra Bhagavathi Temple - Karunagapally"
        title="A devotional home for NRI families staying close to the temple rhythm."
        subtitle="Prarthana brings together guided prayers, daily sacred timing, temple puja requests, and private recordings for families carrying Kerala temple memory across oceans."
        actions={
          <Button href="/register" data-testid="hero-cta-primary">
            Start free - no card needed
          </Button>
        }
        supportingContent={
          <div className="landing-hero-support">
            <p className="hero__supporting-note">Free to begin. Upgrade only when your family is ready.</p>
            <p className="hero__supporting-note">
              Serving NRI families across the UK, US, Canada, UAE, and Australia
            </p>
            {!session ? (
              <Link href="/login" data-testid="hero-signin-link" className="hero__text-link">
                Sign in
              </Link>
            ) : null}
          </div>
        }
        watermark={OM_SYMBOL}
        aside={
          <div className="hero-side-stack">
            {panchang ? (
              <div className={`surface-card hero-snippet hero-snippet--${panchangTone}`}>
                <p className="eyebrow">{"Today's panchang"}</p>
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
        dataTestId="temple-trust"
        title="Temple trust"
        subtitle="The web experience should answer the questions families abroad actually ask before they place their faith in it."
      >
        <MetricGrid
          items={[
            { label: "Temple queue", value: "Connected", helper: "Requests stay aligned to the real temple queue" },
            { label: "Temple priest", value: "Licensed Tantri", helper: "Offerings are performed by the temple tradition" },
            { label: "Sacred video", value: "48h delivery", helper: "HD recording arrives privately to your account" },
            { label: "Family intent", value: "Name-linked", helper: "Prayers are offered in your family's name" }
          ]}
        />
      </Section>

      <Section
        dataTestId="how-it-works"
        title="How Prarthana works"
        subtitle="Your family's name reaches the temple in three steps."
      >
        <div className="process-grid">
          {howItWorksSteps.map((step, index) => (
            <article key={step.title} data-testid="how-it-works-step" className="surface-card process-card">
              <span className="process-card__badge" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
        <div className="card-actions">
          <Button href="/register">Begin your first prayer - it&apos;s free</Button>
        </div>
      </Section>

      <Section
        dataTestId="occasion-entry"
        title="What brings your family here today?"
        subtitle="Choose the entry point that matches the reason you arrived."
      >
        <div className="occasion-grid">
          {occasionCards.map((card) => (
            <Link key={card.label} data-testid="occasion-card" href={card.href} className="surface-card occasion-card">
              <span className="occasion-card__icon" aria-hidden="true">
                {card.icon}
              </span>
              <strong>{card.label}</strong>
              <span className="occasion-card__arrow">{"Open ->"}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        dataTestId="featured-prayers"
        title="Featured prayers"
        subtitle="A focused library for households that want clarity, pronunciation support, and a calm reading experience."
      >
        <div className="catalog-grid catalog-grid--two">
          {featuredPrayers.slice(0, 2).map((prayer) => (
            <PrayerCard key={prayer._id} prayer={prayer} isAuthenticated={Boolean(session)} />
          ))}
        </div>
      </Section>

      {panchang ? (
        <Section
          title={"Today's rhythm"}
          subtitle="Keep the daily sacred timing visible even while you explore prayers and pujas."
        >
          <PanchangSummary panchang={panchang} />
        </Section>
      ) : null}

      <Section
        title="Temple offerings"
        subtitle="Waitlist-based offerings stay temple-led, with the context families need before they submit."
      >
        <div className="catalog-grid">
          {pujas.slice(0, 3).map((puja) => (
            <PujaCard key={puja._id} puja={puja} currency={DEFAULT_DISPLAY_CURRENCY} />
          ))}
        </div>
      </Section>

      <Section
        title="Membership tiers"
        subtitle="Start free, move to Bhakt for daily rhythm, or choose Seva when your family wants the full sacred archive."
      >
        <div className="billing-grid billing-grid--preview">
          {planPreview.map((plan) => {
            const monthly = getBillingPrice(plan, "month");
            return (
              <article key={plan.tier} className="surface-card billing-plan-card">
                <div className="surface-card__meta">
                  <span className="pill pill--soft">{plan.name}</span>
                  {plan.badge ? <span className="muted">{plan.badge}</span> : null}
                </div>
                <h3>{plan.name}</h3>
                <p>{plan.summary}</p>
                <div className="billing-plan-card__price">
                  <strong>{monthly ? formatBillingPrice(monthly) : "Free"}</strong>
                  <span>{monthly ? "/month" : "to begin"}</span>
                </div>
                <ul className="card-list billing-plan-card__perks">
                  {plan.perks.slice(0, 3).map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        <div className="card-actions">
          <Button href="/plans">View all plans</Button>
        </div>
      </Section>

      <Section
        title="Privacy declaration"
        subtitle="Privacy is part of the product, not something hidden in the footer."
      >
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
