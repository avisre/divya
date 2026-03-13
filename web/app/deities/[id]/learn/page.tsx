import { notFound } from "next/navigation";
import { Hero } from "../../../../components/content/Hero";
import { Section } from "../../../../components/content/Section";
import { Button } from "../../../../components/ui/Button";
import { getLearningPath } from "../../../../lib/data";
import { requireSession } from "../../../../lib/session";

export default async function LearningPathPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession(`/deities/${id}/learn`);
  const learningPath = await getLearningPath(id, session.token).catch(() => null);

  if (!learningPath) {
    notFound();
  }

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Learning path"
        title={`Journey with ${learningPath.deity.name.en}`}
        subtitle={`${learningPath.progress?.completedCount || 0} of ${learningPath.totalModules} modules completed.`}
      />
      <Section title="Modules" subtitle="Read the path in order so meaning builds steadily.">
        <div className="content-grid">
          {learningPath.modules.map((module) => (
            <article key={module._id} className="surface-card">
              <div className="surface-card__meta">
                <span className="pill">Module {module.order}</span>
                <span className="muted">{module.readTime || 5} min</span>
              </div>
              <h3>{module.title}</h3>
              <p>{module.keyTakeaway}</p>
              <div className="card-actions">
                <Button href={`/deities/${id}/learn/${module._id}`}>{module.isLockedByTier ? "View module" : "Read module"}</Button>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
