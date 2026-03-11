import { Hero } from "../../components/content/Hero";
import { MetricGrid } from "../../components/content/MetricGrid";
import { PanchangSummary } from "../../components/content/PanchangSummary";
import { PrayerCard } from "../../components/content/PrayerCard";
import { PujaCard } from "../../components/content/PujaCard";
import { Section } from "../../components/content/Section";
import { Button } from "../../components/ui/Button";
import { getBookings, getDailyRecommendation, getFeaturedPrayers, getPanchangToday, getPujas } from "../../lib/data";
import { requireSession } from "../../lib/session";

export default async function HomePage() {
  const session = await requireSession("/home");
  const timezone = session.user.timezone || "Asia/Kolkata";

  const [recommendation, panchang, pujas, bookings, featuredPrayers] = await Promise.all([
    getDailyRecommendation(timezone, session.token).catch(() => null),
    getPanchangToday(timezone).catch(() => null),
    getPujas(session.user.currency || "USD").catch(() => []),
    getBookings(session.token).catch(() => []),
    getFeaturedPrayers().catch(() => [])
  ]);

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Today"
        title={`Welcome back, ${session.user.name}. Keep one sacred rhythm today.`}
        subtitle="Open one prayer, review your panchang, and keep your temple offerings moving without losing context."
        actions={
          <>
            <Button href={recommendation?.prayer ? `/prayers/${recommendation.prayer.slug}` : "/prayers"}>
              {recommendation?.prayer ? "Begin today's prayer" : "Open prayer library"}
            </Button>
            <Button tone="secondary" href="/bookings">
              View bookings
            </Button>
          </>
        }
        aside={
          <div className="surface-card">
            <h3>Your devotional snapshot</h3>
            <MetricGrid
              items={[
                { label: "Current streak", value: `${session.user.streak?.current || 0} days` },
                { label: "Subscription", value: session.user.subscription?.tier || "free" },
                { label: "Tracked bookings", value: `${bookings.length}` },
                { label: "Timezone", value: timezone.replace("_", " ") }
              ]}
            />
          </div>
        }
      />
      {panchang ? (
        <Section title="Daily guidance" subtitle="Timezone-aware context for the rest of your devotional day.">
          <PanchangSummary panchang={panchang} />
        </Section>
      ) : null}
      <Section title="Today's recommendation" subtitle="Move from guidance to action without searching.">
        <div className="content-grid">
          {recommendation?.prayer ? (
            <PrayerCard prayer={recommendation.prayer} />
          ) : (
            <div className="surface-card surface-card--feature">
              <h3>No recommendation yet</h3>
              <p>Your next prayer suggestion will appear here once panchang guidance is available.</p>
            </div>
          )}
          <div className="surface-card">
            <h3>Your account summary</h3>
            <MetricGrid
              items={[
                { label: "Current streak", value: `${session.user.streak?.current || 0}` },
                { label: "Subscription", value: session.user.subscription?.tier || "free" },
                { label: "Bookings", value: `${bookings.length}` }
              ]}
            />
          </div>
        </div>
      </Section>
      <Section title="Temple and prayer library" subtitle="Keep the next sacred step visible.">
        <div className="content-grid">
          {featuredPrayers.slice(0, 2).map((prayer) => <PrayerCard key={prayer._id} prayer={prayer} />)}
          {pujas.slice(0, 2).map((puja) => <PujaCard key={puja._id} puja={puja} currency={session.user.currency || "USD"} />)}
        </div>
      </Section>
    </div>
  );
}
