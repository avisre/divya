import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LearnCard } from "../../../components/content/LearnCard";
import { LearnMarkdown } from "../../../components/content/LearnMarkdown";
import { LearnPaywall } from "../../../components/content/LearnPaywall";
import { Section } from "../../../components/content/Section";
import { getPujas } from "../../../lib/data";
import {
  canViewLearnEntry,
  getLearnCategoryHref,
  getLearnCategoryLabel,
  getLearnEntry,
  getLearnPreviewText,
  getRelatedLearnEntries,
  getRelatedPracticeHref
} from "../../../lib/learn";
import { buildPublicMetadata } from "../../../lib/seo";
import { getOptionalSession } from "../../../lib/session";
import { DEFAULT_DISPLAY_CURRENCY } from "../../../lib/format";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getLearnEntry(slug);

  if (!entry) {
    return buildPublicMetadata({
      title: "Learn",
      description: "The tradition behind the prayers and offerings.",
      path: "/learn"
    });
  }

  return buildPublicMetadata({
    title: `${entry.title} | Learn`,
    description: entry.subtitle,
    path: `/learn/${entry.slug}`
  });
}

export default async function LearnEntryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getLearnEntry(slug);
  if (!entry) {
    notFound();
  }

  const [session, pujas] = await Promise.all([
    getOptionalSession(),
    getPujas(DEFAULT_DISPLAY_CURRENCY).catch(() => [])
  ]);
  const viewerTier = session?.user.subscription?.tier || "free";
  const canViewFullEntry = canViewLearnEntry(entry, viewerTier);
  const relatedEntries = getRelatedLearnEntries(entry);
  const practiceHref = getRelatedPracticeHref(entry, pujas);
  const practiceLabel =
    entry.relatedPrayerSlugs.length > 0 ? "Open the related prayer ->" : "Browse the related puja ->";

  return (
    <div className="page-stack">
      <nav data-testid="learn-breadcrumb" className="learn-breadcrumb" aria-label="Breadcrumb">
        <Link href="/learn">Learn</Link>
        <span aria-hidden="true">/</span>
        <Link href={getLearnCategoryHref(entry.category)}>{getLearnCategoryLabel(entry.category)}</Link>
      </nav>

      <header className="surface-card learn-entry__hero">
        <p className="section-label">{getLearnCategoryLabel(entry.category)}</p>
        <h1 data-testid="learn-entry-title">{entry.title}</h1>
        <p className="section-subtitle">{entry.subtitle}</p>
        <p data-testid="learn-read-time" className="muted">
          {entry.readingTimeMinutes} min read · {getLearnCategoryLabel(entry.category)}
        </p>
      </header>

      <Section title={entry.title} subtitle={entry.subtitle}>
        {canViewFullEntry ? (
          <LearnMarkdown markdown={entry.bodyMd} />
        ) : (
          <>
            <div data-testid="learn-entry-preview" className="surface-card learn-entry__preview">
              <p>{getLearnPreviewText(entry, 100)}...</p>
            </div>
            <LearnPaywall />
          </>
        )}
      </Section>

      <Section
        dataTestId="learn-connect-practice"
        title="Connect to practice"
        subtitle="Let the idea move immediately into prayer or temple ritual."
      >
        <div className="surface-card learn-connect-card">
          <p>{entry.connectToPractice}</p>
          <div className="card-actions">
            <Link href={practiceHref} className="inline-link">
              {practiceLabel}
            </Link>
          </div>
        </div>
      </Section>

      <Section title="Related entries" subtitle="Keep the context connected rather than isolated.">
        <div className="learn-grid">
          {relatedEntries.map((relatedEntry) => (
            <div key={relatedEntry.id} data-testid="learn-related-card">
              <LearnCard entry={relatedEntry} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
