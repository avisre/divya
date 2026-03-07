import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { PrayerCard } from "@/components/cards/PrayerCard";
import { OAuthButtons } from "@/components/forms/OAuthButtons";

export default function LandingPage() {
  const { continueAsGuest } = useAuth();
  const featured = useQuery({ queryKey: ["featured-prayers"], queryFn: () => publicApi.featuredPrayers() });
  const temple = useQuery({ queryKey: ["temple"], queryFn: () => publicApi.temple() });
  const prayers = useQuery({ queryKey: ["landing-prayers"], queryFn: () => publicApi.prayers("?limit=20") });
  const pujas = useQuery({ queryKey: ["landing-pujas"], queryFn: () => publicApi.pujas("USD") });

  const audioReadyCount = useMemo(
    () => (prayers.data || []).filter((item) => Boolean(item.audioUrl)).length,
    [prayers.data]
  );

  return (
    <div className="page-stack">
      <HeroSection
        eyebrow="Divya for diaspora families"
        title="Temple connection, every day, from wherever you live."
        subtitle="Prayers with audio, local-time panchang, temple rituals, and puja waitlists in one clear web experience."
        actions={
          <>
            <Link to="/login" className="btn btn-primary">
              Start with OAuth
            </Link>
            <Button tone="secondary" onClick={() => void continueAsGuest()}>
              Continue as guest
            </Button>
          </>
        }
      >
        <div className="hero-side-card">
          <div className="eyebrow">What you get immediately</div>
          <div className="metric-grid compact-grid">
            <div className="metric-card">
              <strong>{audioReadyCount}</strong>
              <span>Audio-backed prayers</span>
            </div>
            <div className="metric-card">
              <strong>{pujas.data?.length || 0}</strong>
              <span>Temple pujas</span>
            </div>
            <div className="metric-card">
              <strong>Guest</strong>
              <span>No login wall</span>
            </div>
            <div className="metric-card">
              <strong>Local time</strong>
              <span>Panchang guidance abroad</span>
            </div>
          </div>
        </div>
      </HeroSection>

      <SectionCard title="Sign in your way" subtitle="OAuth and email are both supported.">
        <div className="content-grid single-column">
          <article className="content-card">
            <OAuthButtons returnTo="/home" />
            <div className="inline-actions">
              <Link to="/register" className="btn btn-secondary">
                Create with email
              </Link>
              <Link to="/login" className="btn btn-ghost">
                Existing account
              </Link>
            </div>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Designed for families abroad" subtitle="Built for users who cannot walk to a temple daily.">
        <div className="content-grid">
          <article className="content-card">
            <h3>Temple connection without travel</h3>
            <p>Prayer, panchang, temple details, and puja tracking are structured for devotees living in different timezones.</p>
          </article>
          <article className="content-card">
            <h3>English-first, still spiritually grounded</h3>
            <p>Script, transliteration, and meaning stay together so first-generation and second-generation devotees can pray together.</p>
          </article>
          <article className="content-card">
            <h3>Daily utility, not static content</h3>
            <p>Panchang guidance, daily recommendations, and reminders make the app useful every day, not only on festival dates.</p>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Start with a prayer, the temple, or a puja" subtitle="The first screen should make the next sacred action obvious.">
        <div className="content-grid">
          {featured.data?.map((prayer) => <PrayerCard key={prayer._id} prayer={prayer} />)}
          {temple.data ? (
            <article className="content-card">
              <div className="eyebrow">Temple overview</div>
              <h3>{temple.data.name.en}</h3>
              <p>{temple.data.nriNote || temple.data.significance}</p>
              <div className="inline-actions">
                <Link to="/temple" className="btn btn-primary">
                  View temple
                </Link>
                <Link to="/pujas" className="btn btn-secondary">
                  Browse pujas
                </Link>
              </div>
            </article>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="Trust, support, and clarity" subtitle="Support and policy pages are exposed directly in the main navigation.">
        <div className="content-grid">
          <article className="content-card">
            <h3>Support when gothram or booking details are unclear</h3>
            <p>Guests and signed-in users can reach structured support without getting stuck behind account friction.</p>
            <Link to="/contact-us" className="text-link">
              Open support options
            </Link>
          </article>
          <article className="content-card">
            <h3>Clear legal and privacy surfaces</h3>
            <p>Privacy, terms, contact, and sitemap pages are exposed directly from the shell instead of hidden behind admin-style menus.</p>
            <div className="inline-actions">
              <Link to="/privacy" className="text-link">
                Privacy
              </Link>
              <Link to="/terms" className="text-link">
                Terms
              </Link>
            </div>
          </article>
        </div>
        <StatusStrip tone="neutral">
          Web and mobile both use the same MongoDB-backed API for prayer content, booking status, and user profile data.
        </StatusStrip>
      </SectionCard>
    </div>
  );
}
