import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { HeroSection, SectionCard } from "@/components/ui/Surface";

export default function DeityDetailPage() {
  const { id = "" } = useParams();
  const deity = useQuery({ queryKey: ["deity", id], queryFn: () => publicApi.deity(id), enabled: Boolean(id) });
  const learningPath = useQuery({
    queryKey: ["deity-learning-preview", id],
    queryFn: () => publicApi.learningPath(id),
    enabled: Boolean(id)
  });

  if (!deity.data) {
    return <div className="page-state">Loading deity...</div>;
  }

  return (
    <div className="page-stack">
      <HeroSection eyebrow="Deity" title={deity.data.name.en} subtitle={deity.data.shortDescription || deity.data.fullDescription} />
      <SectionCard title="About this deity">
        <p>{deity.data.fullDescription}</p>
        <div className="bullet-grid">
          <div>
            <strong>Tradition</strong>
            <p>{deity.data.tradition}</p>
          </div>
          <div>
            <strong>Pronunciation</strong>
            <p>{deity.data.pronunciationGuide || "Guidance coming soon."}</p>
          </div>
        </div>
      </SectionCard>

      {learningPath.data ? (
        <SectionCard title="Learning path" subtitle={`${learningPath.data.progress?.completedCount || 0} of ${learningPath.data.progress?.totalModules || learningPath.data.totalModules} modules complete.`}>
          <div className="content-grid">
            {learningPath.data.modules.slice(0, 3).map((module) => (
              <article key={module._id} className="content-card">
                <div className="eyebrow">{module.type}</div>
                <h3>{module.title}</h3>
                <p>{module.keyTakeaway}</p>
              </article>
            ))}
          </div>
          <Link to={`/deities/${id}/learn`} className="text-link">
            Open the full learning path
          </Link>
        </SectionCard>
      ) : null}
    </div>
  );
}
