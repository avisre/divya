import { notFound } from "next/navigation";
import { Hero } from "../../../components/content/Hero";
import { Section } from "../../../components/content/Section";
import { Button } from "../../../components/ui/Button";
import { getDeity } from "../../../lib/data";
import { resolveLearningPathData } from "../../../lib/learning";
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
    resolveLearningPathData(id, session?.token || undefined).catch(() => null)
  ]);
  const resolvedDeity = deity || learningPath?.deity || null;

  if (!resolvedDeity) {
    notFound();
  }

  return (
    <div className="page-stack">
      <Hero
        variant="prayer"
        eyebrow="Deity"
        title={resolvedDeity.name.en}
        subtitle={resolvedDeity.shortDescription || resolvedDeity.fullDescription || "Deity overview and learning guidance."}
        actions={
          <Button href={`/deities/${id}/learn`}>Open learning path</Button>
        }
        watermark={resolvedDeity.name.sa?.slice(0, 1) || resolvedDeity.name.en.slice(0, 1)}
      />
      <Section title="About this deity" subtitle="The overview stays short so the learning path can carry the deeper study.">
        <div className="content-grid">
          <div className="surface-card">
            <h3>Tradition</h3>
            <p>{resolvedDeity.tradition || "Tradition details are not set yet."}</p>
          </div>
          <div className="surface-card">
            <h3>Pronunciation support</h3>
            <p>{resolvedDeity.pronunciationGuide || "Pronunciation guidance will appear here."}</p>
          </div>
        </div>
      </Section>
      {learningPath ? (
        <Section title="Learning preview" subtitle={`${learningPath.progress?.completedCount || 0} of ${learningPath.totalModules} modules completed.`}>
          <div className="catalog-grid">
            {learningPath.modules.slice(0, 3).map((module) => (
              <article key={module._id} className="surface-card">
                <div className="surface-card__meta">
                  <span className="pill pill--soft">{module.type}</span>
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
