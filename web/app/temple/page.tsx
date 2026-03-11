import { Hero } from "@/components/content/Hero";
import { MetricGrid } from "@/components/content/MetricGrid";
import { PujaCard } from "@/components/content/PujaCard";
import { Section } from "@/components/content/Section";
import { Button } from "@/components/ui/Button";
import { getPujas, getTemple } from "@/lib/data";

export default async function TemplePage() {
  const [temple, pujas] = await Promise.all([
    getTemple().catch(() => null),
    getPujas("USD").catch(() => [])
  ]);

  if (!temple) {
    return <div className="page-state">Temple details are not available right now.</div>;
  }

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Temple"
        title={temple.name.en}
        subtitle={temple.fullDescription || temple.shortDescription || "Temple details from Karunagapally."}
        actions={
          <>
            <Button href="/pujas">Browse pujas</Button>
            <Button tone="secondary" href="/calendar">
              Festival calendar
            </Button>
          </>
        }
        aside={
          <div className="surface-card">
            <h3>Temple rhythm</h3>
            <MetricGrid
              items={[
                { label: "Temple town", value: temple.location?.city || "Kerala" },
                { label: "Tradition", value: temple.tradition || "Temple-led" },
                { label: "Reference zone", value: temple.panchangLocation?.timezone || "Asia/Kolkata" }
              ]}
            />
          </div>
        }
      />
      <Section title="Temple overview" subtitle="Context first, so each ritual page can stay focused on the offering itself.">
        <div className="content-grid">
          <div className="surface-card surface-card--feature">
            <h3>Why this temple matters</h3>
            <p>{temple.significance || temple.nriNote || "Temple significance details will appear here."}</p>
          </div>
          <div className="surface-card">
            <h3>Ritual windows</h3>
            <div className="list-stack">
              {temple.timings?.pujas?.map((timing) => (
                <div key={`${timing.name}-${timing.timeIST}`} className="list-row">
                  <span>{timing.name}</span>
                  <span>{timing.timeIST} IST</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
      <Section title="Temple offerings" subtitle="These pujas remain tied directly to the temple queue and video-delivery workflow.">
        <div className="content-grid">
          {pujas.slice(0, 4).map((puja) => (
            <PujaCard key={puja._id} puja={puja} />
          ))}
        </div>
      </Section>
    </div>
  );
}
