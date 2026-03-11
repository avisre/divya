import { Hero } from "../../components/content/Hero";
import { PujaCard } from "../../components/content/PujaCard";
import { Section } from "../../components/content/Section";
import { getPujas } from "../../lib/data";

export default async function PujasPage() {
  const pujas = await getPujas("USD").catch(() => []);

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Pujas"
        title="Join sacred waitlists for temple offerings."
        subtitle="Each puja request is coordinated with the temple team and then tracked privately in your account."
      />
      <Section title="Puja catalog" subtitle="All pujas on web stay aligned to the real temple booking flow.">
        <div className="content-grid">
          {pujas.map((puja) => (
            <PujaCard key={puja._id} puja={puja} />
          ))}
        </div>
      </Section>
    </div>
  );
}
