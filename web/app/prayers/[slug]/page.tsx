import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Hero } from "../../../components/content/Hero";
import { Section } from "../../../components/content/Section";
import { StructuredData } from "../../../components/content/StructuredData";
import { PrayerDetailClient } from "../../../components/forms/PrayerDetailClient";
import { getPrayer, getPrayerAudio } from "../../../lib/data";
import { getLearnPrayerEntry } from "../../../lib/learn";
import { getDeitySymbol, getPrayerTypeMeta } from "../../../lib/presentation";
import { buildBreadcrumbSchema, buildPublicMetadata } from "../../../lib/seo";
import { getOptionalSession } from "../../../lib/session";

function canAccessPrayerTier(
  currentTier: "free" | "bhakt" | "seva",
  requiredTier?: "free" | "bhakt" | "seva"
) {
  if (!requiredTier || requiredTier === "free") {
    return true;
  }

  if (requiredTier === "bhakt") {
    return currentTier === "bhakt" || currentTier === "seva";
  }

  return currentTier === "seva";
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prayer = await getPrayer(slug).catch(() => null);

  if (!prayer) {
    return buildPublicMetadata({
      title: "Prayer",
      description: "Guided prayer detail in Prarthana.",
      path: `/prayers/${slug}`
    });
  }

  return buildPublicMetadata({
    title: prayer.title.en,
    description:
      prayer.beginnerNote ||
      prayer.meaning ||
      "Guided devotional prayer with script, transliteration, and meaning.",
    path: `/prayers/${slug}`
  });
}

export default async function PrayerDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getOptionalSession();
  const prayer = await getPrayer(slug).catch(() => null);

  if (!prayer) {
    notFound();
  }

  const currentTier = session?.user.subscription?.tier || "free";
  const resolvedPrayer =
    prayer.entitled === undefined
      ? {
          ...prayer,
          entitled: canAccessPrayerTier(currentTier, prayer.requiredTier)
        }
      : prayer;
  const audio = await getPrayerAudio(resolvedPrayer._id, session?.token ?? null).catch(() => null);
  const prayerType = getPrayerTypeMeta(resolvedPrayer.type);
  const learnEntry = getLearnPrayerEntry(resolvedPrayer);

  return (
    <div className="page-stack">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Prarthana", path: "/" },
          { name: "Prayers", path: "/prayers" },
          { name: resolvedPrayer.title.en, path: `/prayers/${resolvedPrayer.slug}` }
        ])}
      />
      <Hero
        variant="prayer"
        eyebrow={`${prayerType.label} - ${prayerType.descriptor}`}
        title={resolvedPrayer.title.en}
        subtitle={
          resolvedPrayer.plainStory?.split(/\n+/)[0] ||
          resolvedPrayer.beginnerTip ||
          resolvedPrayer.beginnerNote ||
          resolvedPrayer.meaning ||
          "A guided devotional prayer with script, pronunciation help, and meaning."
        }
        watermark={resolvedPrayer.content.devanagari?.trim().slice(0, 1) || "\u0950"}
        aside={
          <div className="surface-card prayer-hero-card">
            <div className="surface-card__meta">
              <span className="pill pill--soft">{prayerType.label}</span>
              <span className="muted">
                ~{resolvedPrayer.durationMinutes} minutes -{" "}
                {resolvedPrayer.verseCount || resolvedPrayer.verses?.length || 1} verse(s)
              </span>
            </div>
            <div className="prayer-card__identity">
              <div className="prayer-card__symbol" aria-hidden="true">
                {getDeitySymbol(resolvedPrayer.deity?.name?.en || resolvedPrayer.title.en)}
              </div>
              <div>
                <div className="muted-label">Deity</div>
                <strong className="prayer-card__deity">
                  {resolvedPrayer.deity?.name?.en || "Temple prayer"}
                </strong>
              </div>
            </div>
            <p className="muted">
              Audio, script, follow-along pronunciation, meaning, and plain-English context stay
              together so this page works like a guided devotional booklet.
            </p>
          </div>
        }
      />
      <Section
        title="Prayer experience"
        subtitle="Read, listen, and move through the prayer like a printed devotional text rather than a data panel."
      >
        <PrayerDetailClient
          key={resolvedPrayer.slug}
          prayer={resolvedPrayer}
          audio={audio}
          isAuthenticated={Boolean(session)}
          currentTier={currentTier}
        />
      </Section>
      {learnEntry ? (
        <Section
          dataTestId="prayer-deity-learn"
          title={`About ${resolvedPrayer.deity?.name?.en || learnEntry.title}`}
          subtitle="Keep the prayer connected to the tradition it comes from."
        >
          <div className="surface-card learn-context-card">
            <p data-testid="prayer-deity-learn-subtitle">{learnEntry.subtitle}</p>
            <div className="card-actions">
              <Link href={`/learn/${learnEntry.slug}`} className="inline-link">
                Read more {"->"}
              </Link>
            </div>
          </div>
        </Section>
      ) : null}
    </div>
  );
}
