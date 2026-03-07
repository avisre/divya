import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { publicApi, bookingApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { browserTimezone, timeGreeting } from "@/lib/time";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";
import { PanchangPanel } from "@/components/cards/PanchangPanel";
import { PrayerCard } from "@/components/cards/PrayerCard";
import { PujaCard } from "@/components/cards/PujaCard";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const timezone = user?.timezone || browserTimezone();
  const greeting = timeGreeting(timezone);
  const recommendation = useQuery({
    queryKey: ["daily-recommendation", timezone, user?.id],
    queryFn: () => publicApi.dailyRecommendation(timezone)
  });
  const panchang = useQuery({
    queryKey: ["panchang-today", timezone],
    queryFn: () => publicApi.panchangToday(timezone)
  });
  const pujas = useQuery({ queryKey: ["pujas-home"], queryFn: () => publicApi.pujas(user?.currency || "USD") });
  const bookings = useQuery({
    queryKey: ["latest-bookings", user?.id],
    queryFn: () => bookingApi.list(),
    enabled: isAuthenticated
  });

  return (
    <div className="page-stack">
      <HeroSection
        eyebrow="Today"
        title={`${greeting}. Keep one sacred rhythm today.`}
        subtitle="Daily prayer, temple guidance, and puja updates are organized around your local timezone."
        actions={
          <>
            {recommendation.data?.prayer ? (
              <Link to={`/prayers/${recommendation.data.prayer.slug}`} className="btn btn-primary">
                Begin today&apos;s prayer
              </Link>
            ) : (
              <Link to="/prayers" className="btn btn-primary">
                Open prayer library
              </Link>
            )}
            <Link to="/calendar" className="btn btn-secondary">
              View festival calendar
            </Link>
          </>
        }
      >
        <div className="metric-grid compact-grid">
          <div className="metric-card">
            <strong>{user?.streak?.current || 0}</strong>
            <span>Current streak</span>
          </div>
          <div className="metric-card">
            <strong>{panchang.data?.tithi.name || "-"}</strong>
            <span>Today&apos;s tithi</span>
          </div>
          <div className="metric-card">
            <strong>{panchang.data?.nakshatra.name || "-"}</strong>
            <span>Nakshatra</span>
          </div>
          <div className="metric-card">
            <strong>{timezone.replace("_", " ")}</strong>
            <span>Your timezone</span>
          </div>
        </div>
      </HeroSection>

      <SectionCard title="Today" subtitle="Move from guidance to prayer without losing context.">
        <div className="content-grid">
          {recommendation.data?.prayer ? (
            <article className="content-card feature-card">
              <div className="eyebrow">Daily recommendation</div>
              <h3>{recommendation.data.prayer.title.en}</h3>
              <p>
                {recommendation.data.reason ||
                  recommendation.data.prayer.beginnerNote ||
                  recommendation.data.prayer.meaning}
              </p>
              <div className="chip-row">
                <span className="static-chip">{recommendation.data.prayer.durationMinutes} min</span>
                <span className="static-chip">{recommendation.data.prayer.requiredTier || "free"}</span>
                <span className="static-chip">{recommendation.data.prayer.audioUrl ? "Audio ready" : "Text only"}</span>
              </div>
              <div className="inline-actions">
                <Link to={`/prayers/${recommendation.data.prayer.slug}`} className="btn btn-primary">
                  Begin today&apos;s prayer
                </Link>
                <Link to="/prayers" className="btn btn-secondary">
                  Browse all prayers
                </Link>
              </div>
            </article>
          ) : null}
          {panchang.data?.festivalPrep?.length ? (
            <article className="content-card">
              <div className="eyebrow">Festival preparation</div>
              <h3>{panchang.data.festivalPrep[0].name.en}</h3>
              <p>
                Begins in {panchang.data.festivalPrep[0].startsInDays} days.{" "}
                {panchang.data.festivalPrep[0].prepStep?.content || panchang.data.festivalPrep[0].communityNote}
              </p>
              <Link to="/calendar" className="text-link">
                View the full festival calendar
              </Link>
            </article>
          ) : (
            <article className="content-card accent-card">
              <div className="eyebrow">Sacred rhythm</div>
              <h3>Stay consistent today</h3>
              <p>Open one prayer, review today&apos;s panchang, and keep the devotional loop simple.</p>
              <Link to="/prayers" className="text-link">
                Browse the prayer library
              </Link>
            </article>
          )}
        </div>
      </SectionCard>

      {panchang.data ? <PanchangPanel panchang={panchang.data} /> : null}

      <SectionCard title="Temple and bookings" subtitle="Keep the next sacred step obvious.">
        <div className="content-grid">
          {pujas.data?.slice(0, 2).map((puja) => <PujaCard key={puja._id} puja={puja} />)}
        </div>
        {bookings.data?.[0] ? (
          <>
            <StatusStrip tone="neutral">
              Latest booking: {bookings.data[0].bookingReference} | {bookings.data[0].status}
            </StatusStrip>
            <div className="inline-actions">
              <Link to={`/bookings/${bookings.data[0]._id}`} className="btn btn-primary">
                Open booking
              </Link>
              <Link to="/bookings" className="btn btn-secondary">
                View all pujas
              </Link>
            </div>
          </>
        ) : (
          <div className="inline-actions">
            <Link to="/temple" className="btn btn-primary">
              View temple
            </Link>
            <Link to="/pujas" className="btn btn-secondary">
              Browse pujas
            </Link>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Your rhythm" subtitle="A lighter account summary so the home screen still feels personal without becoming cluttered.">
        <div className="metric-grid">
          <div className="metric-card">
            <strong>{user?.streak?.current || 0}</strong>
            <span>Streak days</span>
          </div>
          <div className="metric-card">
            <strong>{isAuthenticated ? user?.subscription?.tier || "free" : "guest"}</strong>
            <span>Current access</span>
          </div>
          <div className="metric-card">
            <strong>{bookings.data?.length || 0}</strong>
            <span>Tracked bookings</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
