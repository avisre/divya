import { notFound } from "next/navigation";
import { Hero } from "../../../../components/content/Hero";
import { Section } from "../../../../components/content/Section";
import { Button } from "../../../../components/ui/Button";
import { FeatureTracker } from "../../../../components/ux/FeatureTracker";
import { resolveLearningPathData } from "../../../../lib/learning";
import { getOptionalSession } from "../../../../lib/session";

export default async function LearningPathPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getOptionalSession();
  const learningPath = await resolveLearningPathData(id, session?.token || null);

  if (!learningPath) {
    notFound();
  }

  return (
    <div className="page-stack">
      <FeatureTracker feature="learning" deityId={learningPath.deity.slug || id} />
      <Hero
        eyebrow="Learning path"
        title={`Journey with ${learningPath.deity.name.en}`}
        subtitle={`${learningPath.progress?.completedCount || 0} of ${learningPath.totalModules} modules completed.`}
      />
      <Section title="Modules" subtitle="A vertical study path gives the modules ritual sequence and narrative gravity.">
        <div className="learning-timeline">
          {learningPath.modules.map((module) => (
            <article key={module._id} className="learning-timeline__item">
              <div className="learning-timeline__number">{String(module.order).padStart(2, "0")}</div>
              <div className="surface-card learning-timeline__card">
                <div className="surface-card__meta">
                  <span className="pill pill--soft">{module.type.replace(/_/g, " ")}</span>
                  <span className="muted">{module.readTime || 5} min</span>
                </div>
                <h3>{module.title}</h3>
                <p>{module.keyTakeaway}</p>
                <div className="card-actions">
                  <Button href={`/deities/${id}/learn/${module._id}`}>Read module</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
