import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "../../../../components/content/Hero";
import { LearnCard } from "../../../../components/content/LearnCard";
import { Section } from "../../../../components/content/Section";
import {
  getLearnCategoryLabel,
  getLearnEntriesByCategory,
  learnCategories
} from "../../../../lib/learn";
import { buildPublicMetadata } from "../../../../lib/seo";
import type { LearnCategory } from "../../../../lib/types";

function isLearnCategory(value: string): value is LearnCategory {
  return learnCategories.includes(value as LearnCategory);
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ cat: string }>;
}): Promise<Metadata> {
  const { cat } = await params;
  if (!isLearnCategory(cat)) {
    return buildPublicMetadata({
      title: "Learn",
      description: "The tradition behind the prayers and offerings.",
      path: "/learn"
    });
  }

  return buildPublicMetadata({
    title: `${getLearnCategoryLabel(cat)} | Learn`,
    description: `Browse ${getLearnCategoryLabel(cat).toLowerCase()} in the Prarthana Learn library.`,
    path: `/learn/category/${cat}`
  });
}

export default async function LearnCategoryPage({
  params
}: {
  params: Promise<{ cat: string }>;
}) {
  const { cat } = await params;
  if (!isLearnCategory(cat)) {
    notFound();
  }

  const entries = getLearnEntriesByCategory(cat);

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Learn"
        title={getLearnCategoryLabel(cat)}
        subtitle={`Browse ${getLearnCategoryLabel(cat).toLowerCase()} in plain, devotional language.`}
      />
      <Section title={getLearnCategoryLabel(cat)} subtitle={`${entries.length} entries`}>
        <div className="learn-grid">
          {entries.map((entry) => (
            <LearnCard key={entry.id} entry={entry} />
          ))}
        </div>
      </Section>
    </div>
  );
}
