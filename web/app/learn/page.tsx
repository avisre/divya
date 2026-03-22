import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "../../components/content/Hero";
import { LearnCard } from "../../components/content/LearnCard";
import { Section } from "../../components/content/Section";
import {
  getBeginnerLearnEntries,
  getFeaturedLearnEntries,
  getLearnCategoryHref,
  getLearnCategoryLabel,
  getLearnEntriesByCategory,
  learnCategories
} from "../../lib/learn";
import { buildPublicMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Learn",
  description: "The tradition behind the prayers and offerings.",
  path: "/learn"
});

export default function LearnIndexPage() {
  const featuredEntries = getFeaturedLearnEntries();
  const beginnerEntries = getBeginnerLearnEntries();

  return (
    <div data-testid="learn-index" className="page-stack">
      <Hero
        eyebrow="Learn"
        title="Learn"
        subtitle="The tradition behind the prayers and offerings."
        supportingContent={
          <div className="learn-index__anchors">
            {learnCategories.map((category) => (
              <Link key={category} href={`#${category}`} className="inline-link">
                {getLearnCategoryLabel(category)}
              </Link>
            ))}
          </div>
        }
      />

      <Section
        dataTestId="learn-featured"
        title="Featured"
        subtitle="Three strong entry points into the tradition."
      >
        <div className="learn-grid learn-grid--featured">
          {featuredEntries.map((entry) => (
            <LearnCard key={entry.id} entry={entry} />
          ))}
        </div>
      </Section>

      {learnCategories.map((category) => (
        <Section
          key={category}
          dataTestId="learn-category"
          title={getLearnCategoryLabel(category)}
          subtitle={`Browse ${getLearnCategoryLabel(category).toLowerCase()} in plain, devotional language.`}
        >
          <div id={category} className="learn-grid">
            {getLearnEntriesByCategory(category).map((entry) => (
              <LearnCard key={entry.id} entry={entry} />
            ))}
          </div>
          <div className="card-actions">
            <Link href={getLearnCategoryHref(category)} className="inline-link">
              View all {getLearnCategoryLabel(category).toLowerCase()} {"->"}
            </Link>
          </div>
        </Section>
      ))}

      <Section
        dataTestId="learn-begin"
        title="Good places to begin"
        subtitle="Three entries for people who want the shortest path into the tradition."
      >
        <div className="learn-grid">
          {beginnerEntries.map((entry) => (
            <LearnCard key={entry.id} entry={entry} />
          ))}
        </div>
      </Section>
    </div>
  );
}
