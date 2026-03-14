import { notFound } from "next/navigation";
import { Hero } from "../../../../../components/content/Hero";
import { Section } from "../../../../../components/content/Section";
import { Button } from "../../../../../components/ui/Button";
import { FeatureTracker } from "../../../../../components/ux/FeatureTracker";
import { resolveLearningModuleData } from "../../../../../lib/learning";
import { getOptionalSession } from "../../../../../lib/session";

export default async function LearningModulePage({
  params
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  const { id, moduleId } = await params;
  const session = await getOptionalSession();
  const moduleData = await resolveLearningModuleData(id, moduleId, session?.token || null);

  if (!moduleData) {
    notFound();
  }

  return (
    <div className="page-stack">
      <FeatureTracker feature="learning" deityId={id} />
      <Hero
        eyebrow="Learning module"
        title={moduleData.module.title}
        subtitle={moduleData.module.keyTakeaway}
      />
      <Section title="Module content" subtitle="The reading surface should feel like a long-form devotional text, with the linked prayer nearby rather than buried.">
        <div className="content-grid content-grid--reading">
          <div className="surface-card reading-panel reading-panel--module">
            {moduleData.module.content}
          </div>
          <aside className="surface-card linked-prayer-card">
            <h3>Linked prayer</h3>
            <p>
              {moduleData.module.linkedPrayer
                ? `${moduleData.module.linkedPrayer.title.en} is linked to this module.`
                : "No linked prayer is attached to this module yet."}
            </p>
            <div className="card-actions">
              {moduleData.module.linkedPrayer ? (
                <Button href={`/prayers/${moduleData.module.linkedPrayer.slug}`}>Open linked prayer</Button>
              ) : null}
              <Button tone="secondary" href={`/deities/${id}/learn`}>
                Back to learning path
              </Button>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
}
