import { notFound } from "next/navigation";
import { Hero } from "../../../components/content/Hero";
import { Section } from "../../../components/content/Section";
import { Button } from "../../../components/ui/Button";
import { getDeity, getLearningPath } from "../../../lib/data";
import { getOptionalSession } from "../../../lib/session";

export default async function DeityDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getOptionalSession();
  const [deity, learningPath] = await Promise.all([
    getDeity(id).catch(() => null),
    getLearningPath(id, session?.token || undefined).catch(() => null)
  ]);

  if (!deity) {
    notFound();
  }

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Deity"
        title={deity.name.en}
        subtitle={deity.shortDescription || deity.fullDescription || "Deity overview and learning guidance."}
        actions={
          <Button href={`/deities/${id}/learn`}>Open learning path</Button>
        }
      />
      <Section title="About this deity" subtitle="The overview stays short so the learning path can carry the deeper study.">
        <div className="content-grid">
          <div className="surface-card">
            <h3>Tradition</h3>
            <p>{deity.tradition || "Tradition details are not set yet."}</p>
          </div>
          <div className="surface-card">
            <h3>Pronunciation support</h3>
            <p>{deity.pronunciationGuide || "Pronunciation guidance will appear here."}</p>
          </div>
        </div>
      </Section>
      {learningPath ? (
        <Section title="Learning preview" subtitle={`${learningPath.progress?.completedCount || 0} of ${learningPath.totalModules} modules completed.`}>
          <div className="content-grid">
            {learningPath.modules.slice(0, 3).map((module) => (
              <article key={module._id} className="surface-card">
                <div className="surface-card__meta">
                  <span className="pill">{module.type}</span>
                  <span className="muted">{module.readTime || 5} min</span>
                </div>
                <h3>{module.title}</h3>
                <p>{module.keyTakeaway}</p>
              </article>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
