import Link from "next/link";
import { getLearnCategoryLabel } from "../../lib/learn";
import type { LearnEntry } from "../../lib/types";

export function LearnCard({
  entry,
  href
}: {
  entry: LearnEntry;
  href?: string;
}) {
  const targetHref = href || `/learn/${entry.slug}`;

  return (
    <article data-testid="learn-card" className="surface-card learn-card">
      <div className="surface-card__meta">
        <span className="pill pill--soft">{getLearnCategoryLabel(entry.category)}</span>
        <span className="muted">
          {entry.readingTimeMinutes} min read{entry.tier === "bhakt" ? " · Bhakt" : ""}
        </span>
      </div>
      <h3>{entry.title}</h3>
      <p>{entry.subtitle}</p>
      <div className="card-actions">
        <Link href={targetHref} className="inline-link">
          Read more {"->"}
        </Link>
      </div>
    </article>
  );
}
