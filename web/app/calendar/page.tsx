import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { Button } from "../../components/ui/Button";
import { formatDate, formatRelativeDays } from "../../lib/format";
import { getFestivals, getPanchangToday, getPanchangUpcoming } from "../../lib/data";
import { getOptionalSession } from "../../lib/session";

export default async function CalendarPage() {
  const session = await getOptionalSession();
  const timezone = session?.user.timezone || "Asia/Kolkata";
  const [today, festivals, upcoming] = await Promise.all([
    getPanchangToday(timezone).catch(() => null),
    getFestivals(60).catch(() => []),
    getPanchangUpcoming(timezone, 14).catch(() => [])
  ]);
  const prepPrayerSlug = today?.festivalPrep?.[0]?.prepStep?.prayers?.[0]?.slug;
  const featuredFestivalPrayerSlug = festivals.find((festival) => festival.featuredPrayer?.slug)?.featuredPrayer?.slug;
  const primaryCalendarHref = prepPrayerSlug
    ? `/prayers/${prepPrayerSlug}`
    : featuredFestivalPrayerSlug
      ? `/prayers/${featuredFestivalPrayerSlug}`
      : "/prayers";

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Calendar"
        title="Festival preparation and daily spiritual timing."
        subtitle="See upcoming festivals, tithi context, and the devotional rhythm of the next fourteen days."
        actions={
          <>
            <Button href={primaryCalendarHref}>
              {prepPrayerSlug || featuredFestivalPrayerSlug ? "Start festival prayer" : "Browse prayers"}
            </Button>
            <Button tone="secondary" href="/temple">
              Temple guidance
            </Button>
          </>
        }
      />
      <Section title="Upcoming festivals" subtitle="Preparation matters as much as the festival day itself.">
        <div className="content-grid">
          {festivals.map((festival) => (
            <article key={festival._id} className="surface-card">
              <div className="surface-card__meta">
                <span className="pill">{formatRelativeDays(festival.startsInDays)}</span>
                <span className="muted">{festival.monthHint || (festival.startDate ? formatDate(festival.startDate) : "TBD")}</span>
              </div>
              <h3>{festival.name.en}</h3>
              <p>{festival.description}</p>
              <div className="inline-actions">
                <Button href={festival.featuredPrayer?.slug ? `/prayers/${festival.featuredPrayer.slug}` : "/prayers"}>
                  {festival.featuredPrayer?.slug ? "Start featured prayer" : "Browse prayers"}
                </Button>
                <Button tone="secondary" href="/temple">
                  Temple guidance
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Next 14 panchang days" subtitle="A light operational view for families who want to stay consistent.">
        <div className="content-grid">
          {upcoming.map((day) => (
            <article key={day.date} className="surface-card">
              <div className="surface-card__meta">
                <span className="pill">{formatDate(day.date, { month: "short", day: "numeric" })}</span>
                <span className="muted">{day.nakshatra.name}</span>
              </div>
              <h3>{day.tithi.name}</h3>
              <p>{day.dailyGuidance?.overall || "Daily guidance is available for this day."}</p>
              <div className="inline-actions">
                <Button href="/prayers">Browse prayers</Button>
                <Button tone="secondary" href="/temple">Temple guidance</Button>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
