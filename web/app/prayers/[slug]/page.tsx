import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "../../../components/content/Hero";
import { Section } from "../../../components/content/Section";
import { StructuredData } from "../../../components/content/StructuredData";
import { PrayerDetailClient } from "../../../components/forms/PrayerDetailClient";
import { getPrayer, getPrayerAudio } from "../../../lib/data";
import { getDeitySymbol, getPrayerTypeMeta } from "../../../lib/presentation";
import { buildBreadcrumbSchema, buildPublicMetadata } from "../../../lib/seo";
import { getOptionalSession } from "../../../lib/session";

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

  const audio = session?.token
    ? await getPrayerAudio(prayer._id, session.token).catch(() => null)
    : null;
  const prayerType = getPrayerTypeMeta(prayer.type);

  return (
    <div className="page-stack">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Prarthana", path: "/" },
          { name: "Prayers", path: "/prayers" },
          { name: prayer.title.en, path: `/prayers/${prayer.slug}` }
        ])}
      />
      <Hero
        variant="prayer"
        eyebrow={`${prayerType.label} · ${prayerType.descriptor}`}
        title={prayer.title.en}
        subtitle={
          prayer.plainStory?.split(/\n+/)[0] ||
          prayer.beginnerTip ||
          prayer.beginnerNote ||
          prayer.meaning ||
          "A guided devotional prayer with script, pronunciation help, and meaning."
        }
        watermark={prayer.content.devanagari?.trim().slice(0, 1) || "\u0950"}
        aside={
          <div className="surface-card prayer-hero-card">
            <div className="surface-card__meta">
              <span className="pill pill--soft">{prayerType.label}</span>
              <span className="muted">~{prayer.durationMinutes} minutes · {prayer.verseCount || prayer.verses?.length || 1} verse(s)</span>
            </div>
            <div className="prayer-card__identity">
              <div className="prayer-card__symbol" aria-hidden="true">
                {getDeitySymbol(prayer.deity?.name?.en || prayer.title.en)}
              </div>
              <div>
                <div className="muted-label">Deity</div>
                <strong className="prayer-card__deity">{prayer.deity?.name?.en || "Temple prayer"}</strong>
              </div>
            </div>
            <p className="muted">
              Audio, script, follow-along pronunciation, meaning, and plain-English context stay together so this page works like a guided devotional booklet.
            </p>
          </div>
        }
      />
      <Section
        title="Prayer experience"
        subtitle="Read, listen, and move through the prayer like a printed devotional text rather than a data panel."
      >
        <PrayerDetailClient key={prayer.slug} prayer={prayer} audio={audio} isAuthenticated={Boolean(session)} />
      </Section>
    </div>
  );
}
