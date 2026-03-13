import { Hero } from "../components/content/Hero";
import { MetricGrid } from "../components/content/MetricGrid";
import { PanchangSummary } from "../components/content/PanchangSummary";
import { PrayerCard } from "../components/content/PrayerCard";
import { PujaCard } from "../components/content/PujaCard";
import { Section } from "../components/content/Section";
import { Button } from "../components/ui/Button";
import { getFeaturedPrayers, getPanchangToday, getPujas, getTemple } from "../lib/data";

export default async function LandingPage() {
  const [featuredPrayers, temple, panchang, pujas] = await Promise.all([
    getFeaturedPrayers().catch(() => []),
    getTemple().catch(() => null),
    getPanchangToday("Asia/Kolkata").catch(() => null),
    getPujas("USD").catch(() => [])
  ]);

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Temple connection for families abroad"
        title="A devotional web home for prayer, panchang, puja waitlists, and sacred records."
        subtitle="Divya brings together guided prayers, local-time spiritual guidance, temple offerings, and private booking records in one calm, secure experience."
        actions={
          <>
            <Button href="/register">Create account</Button>
            <Button tone="secondary" href="/login">
              Sign in
            </Button>
          </>
        }
        aside={
          <div className="surface-card">
            <h3>What the web app covers</h3>
            <MetricGrid
              items={[
                { label: "Featured prayers", value: `${featuredPrayers.length}+` },
                { label: "Temple offerings", value: `${pujas.length}` },
                { label: "Sacred videos", value: "Private" },
                { label: "Support surface", value: "Direct" }
              ]}
            />
          </div>
        }
      />

      <Section title="Start here" subtitle="Choose the next sacred action without guessing where the app begins.">
        <div className="content-grid">
          <div className="surface-card surface-card--feature">
            <h3>Create or resume your account</h3>
            <p>Email sign-in and Google sign-in are both available. Your web session stays protected without exposing account tokens in the browser.</p>
            <div className="card-actions">
              <Button href="/register">Create account</Button>
              <Button tone="secondary" href="/login">
                Sign in
              </Button>
            </div>
          </div>
          {temple ? (
            <div className="surface-card surface-card--warm">
              <h3>{temple.name.en}</h3>
              <p>{temple.nriNote || temple.significance || temple.fullDescription}</p>
              <div className="card-actions">
                <Button href="/temple">View temple</Button>
                <Button tone="secondary" href="/pujas">
                  Browse pujas
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Section>

      {panchang ? (
        <Section title="Today" subtitle="Keep your day spiritually anchored before you pick a prayer or a puja.">
          <PanchangSummary panchang={panchang} />
        </Section>
      ) : null}

      <Section title="Featured prayers" subtitle="Open one prayer and continue your rhythm from anywhere.">
        <div className="content-grid">
          {featuredPrayers.slice(0, 3).map((prayer) => (
            <PrayerCard key={prayer._id} prayer={prayer} />
          ))}
        </div>
      </Section>

      <Section title="Temple offerings" subtitle="Waitlist-based pujas remain tied directly to the temple workflow.">
        <div className="content-grid">
          {pujas.slice(0, 3).map((puja) => (
            <PujaCard key={puja._id} puja={puja} />
          ))}
        </div>
      </Section>

      <Section title="Trust and privacy" subtitle="The web app is designed for real family use, not a demo flow.">
        <div className="content-grid">
          <div className="surface-card">
            <h3>Private by default</h3>
            <p>Sessions are stored in secure HttpOnly cookies. Your browser does not keep account tokens in local or session storage.</p>
          </div>
          <div className="surface-card">
            <h3>Same backend, stronger web security</h3>
            <p>The web app uses the same MongoDB-backed backend as mobile, while routing sensitive requests through a same-origin server layer.</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
