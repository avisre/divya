import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { formatDate, formatRelativeDays } from "../../lib/format";
import { getFestivals, getPanchangUpcoming } from "../../lib/data";
import { getOptionalSession } from "../../lib/session";

export default async function CalendarPage() {
  const session = await getOptionalSession();
  const timezone = session?.user.timezone || "Asia/Kolkata";
  const [festivals, upcoming] = await Promise.all([
    getFestivals(60).catch(() => []),
    getPanchangUpcoming(timezone, 14).catch(() => [])
  ]);

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Calendar"
        title="Festival preparation and daily spiritual timing."
        subtitle="See upcoming festivals, tithi context, and the devotional rhythm of the next fourteen days."
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
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
