import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { PrayerCard } from "@/components/cards/PrayerCard";

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
        eyebrow="Sacred prayer for the diaspora"
        title="Keep Bhadra Bhagavathi close, wherever you live."
        subtitle="Daily prayers, local-time panchang, Kerala temple rituals, and sacred puja waitlists for families living far from home."
        actions={
          <>
            <Button onClick={() => void continueAsGuest()}>Continue as guest</Button>
            <Link to="/register" className="btn btn-secondary">
              Create account
            </Link>
          </>
        }
      >
        <div className="hero-side-card">
          <div className="eyebrow">What the web app gives you</div>
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
              <span>Browse before signup</span>
            </div>
            <div className="metric-card">
              <strong>Local time</strong>
              <span>Panchang guidance abroad</span>
            </div>
          </div>
        </div>
      </HeroSection>

      <SectionCard title="Designed for families abroad" subtitle="The product is optimized for distance, timezone shifts, and second-generation clarity.">
        <div className="content-grid">
          <article className="content-card">
            <h3>Temple connection without a local temple visit</h3>
            <p>Prayer, temple details, puja waitlists, and video delivery are all structured for devotees living abroad.</p>
          </article>
          <article className="content-card">
            <h3>English-first, still spiritually grounded</h3>
            <p>Script, transliteration, and meaning stay visible together so families can pray across generations without friction.</p>
          </article>
          <article className="content-card">
            <h3>Daily utility, not just static content</h3>
            <p>Panchang, daily recommendation, streak cues, and festival preparation give the site a reason to be opened every day.</p>
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

      <SectionCard title="Trust, support, and clarity" subtitle="The web app should feel reliable before a user ever books a puja.">
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
          Prayer text and audio on the web app are served from the same Mongo-backed API used by the mobile product.
        </StatusStrip>
      </SectionCard>
    </div>
  );
}
