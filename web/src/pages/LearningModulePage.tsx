import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { publicApi, userApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";

export default function LearningModulePage() {
  const { id = "", moduleId = "" } = useParams();
  const module = useQuery({
    queryKey: ["learning-module", id, moduleId],
    queryFn: () => publicApi.learningModule(id, moduleId),
    enabled: Boolean(id && moduleId)
  });
  const completeMutation = useMutation({
    mutationFn: () => userApi.completeLearningModule(id, moduleId)
  });

  if (!module.data) {
    return <div className="page-state">Loading module...</div>;
  }

  return (
    <div className="page-stack">
      <HeroSection eyebrow="Learning module" title={module.data.module.title} subtitle={module.data.module.keyTakeaway} />
      <SectionCard title="Module content">
        <div className="reading-surface">{module.data.module.content}</div>
      </SectionCard>
      {module.data.module.linkedPrayer ? (
        <SectionCard title="Practice this module">
          <Link to={`/prayers/${module.data.module.linkedPrayer.slug}`} className="text-link">
            Open {module.data.module.linkedPrayer.title.en}
          </Link>
        </SectionCard>
      ) : null}
      {completeMutation.isSuccess ? <StatusStrip tone="success">Module marked complete.</StatusStrip> : null}
      <Button onClick={() => completeMutation.mutate()}>Mark module complete</Button>
    </div>
  );
}
