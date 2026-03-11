import { notFound } from "next/navigation";
import { BookingPanel } from "../../../components/forms/BookingPanel";
import { Hero } from "../../../components/content/Hero";
import { MetricGrid } from "../../../components/content/MetricGrid";
import { Section } from "../../../components/content/Section";
import { formatPrice } from "../../../lib/format";
import { getPuja } from "../../../lib/data";
import { getOptionalSession } from "../../../lib/session";

export default async function PujaDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, puja] = await Promise.all([
    getOptionalSession(),
    getPuja(id, "USD").catch(() => null)
  ]);

  if (!puja) {
    notFound();
  }

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Temple offering"
        title={puja.name.en}
        subtitle={puja.description?.short || puja.description?.full || "Sacred offering coordinated directly with the temple."}
        aside={
          <div className="surface-card">
            <h3>Offering snapshot</h3>
            <MetricGrid
              items={[
                { label: "Displayed price", value: formatPrice(puja.displayPrice?.amount, puja.displayPrice?.currency || "USD") },
                { label: "Duration", value: `${puja.duration || 0} min` },
                { label: "Availability", value: puja.isWaitlistOnly ? "Waitlist" : "Open" }
              ]}
            />
          </div>
        }
      />
      <Section title="Why families choose this puja" subtitle={puja.description?.nriNote || "Use the ritual notes to understand what the temple performs on your behalf."}>
        <div className="content-grid">
          <div className="surface-card surface-card--feature">
            <h3>Benefits</h3>
            <div className="list-stack">
              {(puja.benefits || []).map((benefit) => <div key={benefit} className="list-row"><span>{benefit}</span></div>)}
            </div>
          </div>
          <div className="surface-card">
            <h3>What happens</h3>
            <p>{puja.description?.whatHappens || puja.description?.full}</p>
            <div className="list-stack">
              {(puja.requirements || []).map((item) => <div key={item} className="list-row"><span>{item}</span></div>)}
            </div>
          </div>
        </div>
      </Section>
      <Section title="Join the sacred waitlist" subtitle="Submit for yourself or gift the offering to someone else.">
        <BookingPanel puja={puja} isAuthenticated={Boolean(session)} />
      </Section>
    </div>
  );
}
