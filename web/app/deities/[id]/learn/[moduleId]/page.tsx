import { notFound } from "next/navigation";
import { Hero } from "../../../../../components/content/Hero";
import { Section } from "../../../../../components/content/Section";
import { Button } from "../../../../../components/ui/Button";
import { getLearningModule } from "../../../../../lib/data";
import { requireSession } from "../../../../../lib/session";

export default async function LearningModulePage({
  params
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  const { id, moduleId } = await params;
  const session = await requireSession(`/deities/${id}/learn/${moduleId}`);
  const module = await getLearningModule(id, moduleId, session.token).catch(() => null);

  if (!module) {
    notFound();
  }

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Learning module"
        title={module.module.title}
        subtitle={module.module.keyTakeaway}
      />
      <Section title="Module content" subtitle="Read first, then move into the linked prayer if it is available.">
        <div className="surface-card">
          <div className="reading-panel">{module.module.content}</div>
          <div className="card-actions">
            {module.module.linkedPrayer ? <Button href={`/prayers/${module.module.linkedPrayer.slug}`}>Open linked prayer</Button> : null}
            <Button tone="secondary" href={`/deities/${id}/learn`}>
              Back to learning path
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
