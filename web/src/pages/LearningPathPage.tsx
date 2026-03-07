import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { publicApi } from "@/lib/api";
import { HeroSection, SectionCard } from "@/components/ui/Surface";

export default function LearningPathPage() {
  const { id = "" } = useParams();
  const learningPath = useQuery({
    queryKey: ["learning-path", id],
    queryFn: () => publicApi.learningPath(id),
    enabled: Boolean(id)
  });

  if (!learningPath.data) {
    return <div className="page-state">Loading learning path...</div>;
  }

  return (
    <div className="page-stack">
      <HeroSection
        eyebrow="Learn"
        title={`Journey with ${learningPath.data.deity.name.en}`}
        subtitle={`${learningPath.data.progress?.completedCount || 0} of ${learningPath.data.totalModules} modules complete.`}
      />
      <SectionCard title="Modules">
        <div className="content-grid">
          {learningPath.data.modules.map((module) => (
            <article key={module._id} className="content-card">
              <div className="eyebrow">
                Module {module.order} | {module.readTime || 5} min
              </div>
              <h3>{module.title}</h3>
              <p>{module.keyTakeaway}</p>
              <Link to={`/deities/${id}/learn/${module._id}`} className="text-link">
                {module.isLockedByTier ? "View locked module" : "Read module"}
              </Link>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
