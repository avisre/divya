import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "../../components/content/Hero";
import { MetricGrid } from "../../components/content/MetricGrid";
import { PanchangSummary } from "../../components/content/PanchangSummary";
import { PrayerCard } from "../../components/content/PrayerCard";
import { PujaCard } from "../../components/content/PujaCard";
import { Section } from "../../components/content/Section";
import { HomeDiscovery } from "../../components/ux/HomeDiscovery";
import { Button } from "../../components/ui/Button";
import {
  getBookings,
  getDailyRecommendation,
  getFeaturedPrayers,
  getGiftBookingsReceived,
  getGiftBookingsSent,
  getPanchangToday,
  getPujas,
  getStats,
  getUserPrayerSessions
} from "../../lib/data";
import { getContinuePracticeHref } from "../../lib/gamification";
import { buildPrivateMetadata } from "../../lib/seo";
import { requireSession } from "../../lib/session";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Home",
  description: "Private devotional dashboard for today's prayer rhythm, bookings, and family activity."
});

export default async function HomePage() {
  const session = await requireSession("/home");
  const timezone = session.user.timezone || "Asia/Kolkata";

  const [recommendation, panchang, pujas, bookings, featuredPrayers, giftSent, giftReceived, sharedSessions, stats] =
    await Promise.all([
      getDailyRecommendation(timezone, session.token).catch(() => null),
      getPanchangToday(timezone).catch(() => null),
      getPujas(session.user.currency || "USD").catch(() => []),
      getBookings(session.token).catch(() => []),
      getFeaturedPrayers().catch(() => []),
      getGiftBookingsSent(session.token).catch(() => []),
      getGiftBookingsReceived(session.token).catch(() => []),
      getUserPrayerSessions(session.token).catch(() => []),
      getStats(session.token).catch(() => null)
    ]);

  const recommendationSubtitle = [recommendation?.prayer?.deity?.name?.en, recommendation?.tithi?.name]
    .filter(Boolean)
    .join(" - ");
  const practiceTier = stats?.tier;
  const practiceHref = getContinuePracticeHref(
    stats,
    recommendation?.prayer ? `/prayers/${recommendation.prayer.slug}` : "/prayers"
  );
  const practiceMetrics = [
    { label: "Prayers this month", value: `${stats?.daysPracticedThisMonth || 0}` },
    { label: "Family sessions", value: `${stats?.familySessionsCount || 0}` },
    { label: "Learning modules", value: `${stats?.modulesCompletedCount || 0}` }
  ];
  const showZeroState = (stats?.daysPracticedThisMonth || 0) === 0;

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Today"
        title={`Welcome back, ${session.user.name}. Keep one sacred rhythm today.`}
        subtitle="Let the panchang, one prayer, and your temple record stay in conversation with each other instead of living on separate screens."
        actions={
          <>
            <Button
              href={recommendation?.prayer ? `/prayers/${recommendation.prayer.slug}` : "/prayers"}
              className="button--pulse"
            >
              {recommendation?.prayer ? "Begin today\u2019s prayer" : "Open prayer library"}
            </Button>
            <Button tone="secondary" href="/bookings">
              View bookings
            </Button>
          </>
        }
        aside={
          <div className="surface-card practice-card">
            <h3>Your practice</h3>
            <div className="practice-card__tierline">
              <strong>{practiceTier?.icon || "🪷"} {practiceTier?.key || "SEEKER"}</strong>
              <span>{stats?.totalLotusPoints || 0} lotus points</span>
            </div>
            <div className="practice-progress" aria-label="Progress to next tier">
              <div
                className="practice-progress__value"
                style={{ width: `${practiceTier?.progressPercent || 0}%` }}
              />
            </div>
            <p className="practice-card__next">
              {practiceTier?.nextTier
                ? `${practiceTier.progressPercent}% to ${practiceTier.nextTier.key} (${practiceTier.nextTier.min} pts)`
                : "Highest devotional tier reached."}
            </p>
            <div className="practice-card__metrics">
              {practiceMetrics.map((item) => (
                <div key={item.label} className="practice-card__metric">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="card-actions">
              <Button href={practiceHref}>Continue your practice {"->"}</Button>
              {session.user.subscription?.tier === "free" ? (
                <Button href="/plans" tone="ghost">
                  View plans
                </Button>
              ) : null}
            </div>
          </div>
        }
      />
      {panchang ? (
        <Section
          title={"Today\u2019s panchang"}
          subtitle="Let the home page open with the temple's daily rhythm before recommendations or account nudges."
        >
          <PanchangSummary panchang={panchang} />
        </Section>
      ) : null}
      {showZeroState ? (
        <div className="discovery-banner discovery-banner--vermilion">
          <strong>Today{"\u2019"}s practice</strong>
          <p>
            A gentle rhythm starts with one prayer. Let this month be counted by presence, not pressure.
          </p>
          <div className="card-actions">
            <Button href={recommendation?.prayer ? `/prayers/${recommendation.prayer.slug}` : "/prayers"}>
              {"Start today\u2019s prayer"}
            </Button>
            <Button tone="ghost" href="/sessions/create">
              Pray with family
            </Button>
          </div>
        </div>
      ) : null}
      <Section
        title={"Today\u2019s recommendation"}
        subtitle={"Move directly from the day\u2019s rhythm into one prayer without hunting through the catalog."}
      >
        <div className="content-grid content-grid--asymmetric">
          {recommendation?.prayer ? (
            <article className="surface-card recommendation-card">
              <div className="surface-card__meta">
                <span className="pill pill--soft">Recommended prayer</span>
                <span className="muted">{recommendationSubtitle}</span>
              </div>
              <h3>{recommendation.prayer.title.en}</h3>
              <p>{recommendation.reason || recommendation.prayer.beginnerNote || recommendation.prayer.meaning}</p>
              {recommendation.prayer.deity?.name?.en ? (
                <Link
                  href={`/deities/${recommendation.prayer.deity.slug || recommendation.prayer.deity._id}`}
                  className="recommendation-card__deity"
                >
                  {recommendation.prayer.deity.name.en}
                </Link>
              ) : null}
              <div className="card-actions">
                <Button href={`/prayers/${recommendation.prayer.slug}`}>Open prayer</Button>
              </div>
            </article>
          ) : (
            <div className="surface-card surface-card--feature">
              <h3>No recommendation yet</h3>
              <p>Your next prayer suggestion will appear here once panchang guidance is available.</p>
            </div>
          )}
          <div className="surface-card">
            <h3>Keep the next step visible</h3>
            <MetricGrid
              items={[
                { label: "Prayers ready", value: `${featuredPrayers.length}` },
                { label: "Temple offerings", value: `${pujas.length}` },
                { label: "Tracked bookings", value: `${bookings.length}` }
              ]}
            />
          </div>
        </div>
      </Section>
      <HomeDiscovery
        bookings={bookings}
        giftSent={giftSent}
        giftReceived={giftReceived}
        sharedSessions={sharedSessions || []}
      />
      <Section
        title="Prayer and temple paths"
        subtitle="Open a prayer or a puja from the same dashboard, depending on what your family needs today."
      >
        <div className="catalog-grid catalog-grid--two">
          {featuredPrayers.slice(0, 2).map((prayer) => (
            <PrayerCard key={prayer._id} prayer={prayer} />
          ))}
          {pujas.slice(0, 2).map((puja) => (
            <PujaCard key={puja._id} puja={puja} currency={session.user.currency || "USD"} />
          ))}
        </div>
      </Section>
    </div>
  );
}
