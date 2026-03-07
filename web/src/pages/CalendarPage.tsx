import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";
import { browserTimezone, friendlyDate } from "@/lib/time";
import { HeroSection, SectionCard } from "@/components/ui/Surface";

export default function CalendarPage() {
  const timezone = browserTimezone();
  const festivals = useQuery({ queryKey: ["festivals-upcoming"], queryFn: () => publicApi.festivals(60) });
  const upcoming = useQuery({ queryKey: ["panchang-upcoming", timezone], queryFn: () => publicApi.panchangUpcoming(timezone, 14) });

  return (
    <div className="page-stack">
      <HeroSection eyebrow="Calendar" title="Festival preparation and daily auspiciousness" subtitle="See what is approaching, what to prepare, and how each day is framed spiritually." />
      <SectionCard title="Upcoming festivals">
        <div className="content-grid">
          {festivals.data?.map((festival) => (
            <article key={festival._id} className="content-card">
              <div className="eyebrow">{festival.startsInDays} days away</div>
              <h3>{festival.name.en}</h3>
              <p>{festival.description}</p>
              <div className="card-meta">
                <span>{festival.startDate ? friendlyDate(festival.startDate) : festival.monthHint}</span>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Next 14 panchang days">
        <div className="content-grid">
          {upcoming.data?.map((day) => (
            <article key={day.date} className="content-card">
              <div className="eyebrow">{friendlyDate(day.date)}</div>
              <h3>{day.tithi.name}</h3>
              <p>{day.nakshatra.name}</p>
              <div className="card-meta">
                <span>{day.dailyGuidance?.overall || "Guidance available"}</span>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
