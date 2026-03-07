import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";
import { PujaCard } from "@/components/cards/PujaCard";

export default function TemplePage() {
  const temple = useQuery({ queryKey: ["temple"], queryFn: () => publicApi.temple() });
  const pujas = useQuery({ queryKey: ["temple-pujas"], queryFn: () => publicApi.pujas("USD") });

  if (!temple.data) {
    return <div className="page-state">Loading temple...</div>;
  }

  return (
    <div className="page-stack">
      <HeroSection
        eyebrow="Temple"
        title={temple.data.name.en}
        subtitle={temple.data.fullDescription || temple.data.shortDescription || "Bhadra Bhagavathi Temple, Karunagapally."}
        actions={
          <>
            <Link to="/pujas" className="btn btn-primary">
              Browse temple pujas
            </Link>
            <Link to="/calendar" className="btn btn-secondary">
              Open festival calendar
            </Link>
          </>
        }
      >
        <div className="metric-grid compact-grid">
          <div className="metric-card">
            <strong>{temple.data.location?.city}</strong>
            <span>Temple town</span>
          </div>
          <div className="metric-card">
            <strong>{temple.data.tradition}</strong>
            <span>Tradition</span>
          </div>
          <div className="metric-card">
            <strong>{temple.data.panchangLocation?.timezone || "Asia/Kolkata"}</strong>
            <span>Reference timezone</span>
          </div>
          <div className="metric-card">
            <strong>Kerala Tantric</strong>
            <span>Ritual language</span>
          </div>
        </div>
      </HeroSection>

      <SectionCard title="Temple overview" subtitle="Context first, so the puja pages do not have to repeat the same explanation everywhere.">
        <div className="content-grid">
          <article className="content-card feature-card">
            <h3>Why this temple matters</h3>
            <p>{temple.data.significance}</p>
          </article>
          <article className="content-card accent-card">
            <h3>For families abroad</h3>
            <p>{temple.data.nriNote || "Temple rituals are coordinated directly with the temple team."}</p>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Ritual windows" subtitle="Kerala timing names stay visible while the site explains them plainly.">
        <div className="content-grid">
          {temple.data.timings?.pujas?.map((timing) => (
            <article key={`${timing.name}-${timing.timeIST}`} className="content-card">
              <div className="eyebrow">{timing.nameML || timing.name}</div>
              <h3>{timing.name}</h3>
              <p>{timing.description}</p>
              <div className="card-meta">
                <span>{timing.timeIST} IST</span>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Booking from abroad" subtitle="The web flow should make the remote temple coordination model obvious.">
        <div className="content-grid">
          <article className="content-card">
            <div className="eyebrow">Step 1</div>
            <h3>Join a sacred waitlist</h3>
            <p>Submit devotee details, gothram guidance, and prayer intention without trying to force an instant booking slot.</p>
          </article>
          <article className="content-card">
            <div className="eyebrow">Step 2</div>
            <h3>Temple team coordinates the ritual</h3>
            <p>The puja is performed at Karunagapally and tracked in your account with real booking statuses.</p>
          </article>
          <article className="content-card">
            <div className="eyebrow">Step 3</div>
            <h3>Receive the sacred record</h3>
            <p>Completed pujas move toward video delivery so the family keeps a lasting devotional record.</p>
          </article>
        </div>
        <StatusStrip tone="warning">{temple.data.nriNote || "Temple rituals are coordinated directly with the temple team."}</StatusStrip>
      </SectionCard>

      <SectionCard title="Available pujas" subtitle="Waitlist-first offerings tied directly to this temple.">
        <div className="content-grid">
          {pujas.data?.slice(0, 4).map((puja) => <PujaCard key={puja._id} puja={puja} />)}
        </div>
      </SectionCard>
    </div>
  );
}
