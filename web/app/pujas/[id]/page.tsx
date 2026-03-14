import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingPanel } from "../../../components/forms/BookingPanel";
import { Hero } from "../../../components/content/Hero";
import { MetricGrid } from "../../../components/content/MetricGrid";
import { Section } from "../../../components/content/Section";
import { StructuredData } from "../../../components/content/StructuredData";
import { formatPrice } from "../../../lib/format";
import { getPuja } from "../../../lib/data";
import { getOptionalSession } from "../../../lib/session";
import {
  getPujaBenefitCards,
  getTempleVisual
} from "../../../lib/presentation";
import { buildBreadcrumbSchema, buildPublicMetadata } from "../../../lib/seo";

const benefitSymbols = ["01", "02", "03", "04"];

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const puja = await getPuja(id, "USD").catch(() => null);

  if (!puja) {
    return buildPublicMetadata({
      title: "Temple puja",
      description: "Temple-coordinated puja booking through Prarthana.",
      path: `/pujas/${id}`
    });
  }

  return buildPublicMetadata({
    title: puja.name.en,
    description:
      puja.description?.short ||
      puja.description?.nriNote ||
      "Temple offering coordinated directly with Bhadra Bhagavathi Temple.",
    path: `/pujas/${id}`
  });
}

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

  const templeVisual = getTempleVisual(puja.temple);
  const benefitCards = getPujaBenefitCards(puja);

  return (
    <div className="page-stack">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Prarthana", path: "/" },
          { name: "Pujas", path: "/pujas" },
          { name: puja.name.en, path: `/pujas/${puja._id}` }
        ])}
      />
      <Hero
        variant="puja"
        eyebrow="Temple offering"
        title={puja.name.en}
        subtitle={
          puja.description?.short ||
          puja.description?.full ||
          "Sacred offering coordinated directly with the temple."
        }
        aside={
          <div className="surface-card">
            <h3>Offering snapshot</h3>
            <MetricGrid
              items={[
                {
                  label: "Sacred amount",
                  value: formatPrice(puja.displayPrice?.amount, puja.displayPrice?.currency || "USD")
                },
                { label: "Duration", value: `${puja.duration || 0} min` },
                {
                  label: "Temple status",
                  value: puja.isWaitlistOnly ? "Join sacred waitlist" : "Available"
                }
              ]}
            />
          </div>
        }
      />
      <Section
        title="Why families choose this puja"
        subtitle={
          puja.description?.nriNote ||
          "The strongest reasons to book should read like blessings, not bullets."
        }
      >
        <div className="content-grid content-grid--asymmetric">
          <div className="benefit-grid">
            {benefitCards.map((benefit, index) => (
              <article key={benefit.title} className="surface-card benefit-card">
                <span className="benefit-card__symbol" aria-hidden="true">
                  {benefitSymbols[index % benefitSymbols.length]}
                </span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
          <div className="surface-card ritual-quote">
            <h3>What happens</h3>
            <blockquote>{puja.description?.whatHappens || puja.description?.full}</blockquote>
            <div className="list-stack">
              {(puja.requirements || []).map((item) => (
                <div key={item} className="list-row">
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
      <Section
        title="Performed by the licensed Tantri of Bhadra Bhagavathi Temple"
        subtitle="Trust is earned before a family commits to a waitlist."
      >
        <div className="surface-card tantri-section">
          <figure className="media-frame tantri-section__media">
            <img src={templeVisual.src} alt={templeVisual.alt} className="media-frame__image" />
          </figure>
          <div className="tantri-section__content">
            <p>
              All pujas at Bhadra Bhagavathi Temple in Karunagapally are performed by the
              {" temple\u2019s licensed Tantri under the Kerala Tantric Agama tradition. The Tantri "}
              chants your name and gothram during the ritual. A full HD video is recorded and
              delivered to your account within 48 hours.
            </p>
            <blockquote>
              {"\"We booked Abhishekam for my mother\u2019s birthday. The video arrived the next morning. She watched it three times.\" - Priya S., Toronto"}
            </blockquote>
          </div>
        </div>
      </Section>
      <Section
        title="Join the sacred waitlist"
        subtitle="Submit for yourself or gift the offering as an act of care for someone else."
      >
        <BookingPanel puja={puja} isAuthenticated={Boolean(session)} />
      </Section>
    </div>
  );
}
