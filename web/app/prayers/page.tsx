import type { Metadata } from "next";
import { Hero } from "../../components/content/Hero";
import { PrayerLibraryClient } from "../../components/content/PrayerLibraryClient";
import { Section } from "../../components/content/Section";
import { StructuredData } from "../../components/content/StructuredData";
import { PrayersDiscovery } from "../../components/ux/PrayersDiscovery";
import { Button } from "../../components/ui/Button";
import { getDeities, getPrayers } from "../../lib/data";
import { OM_SYMBOL } from "../../lib/presentation";
import { buildBreadcrumbSchema, buildPublicMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "Prayer library",
  description:
    "Browse guided Hindu prayers with Devanagari script, transliteration, meaning, audio, and family prayer-session entry points.",
  path: "/prayers"
});

export default async function PrayersPage() {
  const [prayers, deities] = await Promise.all([
    getPrayers("?limit=108").catch(() => []),
    getDeities().catch(() => [])
  ]);

  const gayatriPrayer = prayers.find((prayer) => prayer.title.en.toLowerCase().includes("gayatri"));
  const learningCards = deities.slice(0, 3);
  const featuredLearningDeity = learningCards[0]?.name.en || "Bhadra Bhagavathi";
  const learningHref = learningCards[0] ? `/deities/${learningCards[0].slug}/learn` : "/prayers";

  return (
    <div className="page-stack">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Prarthana", path: "/" },
          { name: "Prayers", path: "/prayers" }
        ])}
      />
      <Hero
        variant="prayer"
        eyebrow="Prayer library"
        title="Script, transliteration, and meaning in a library built for daily devotion."
        subtitle="Browse temple-linked prayers with a typeset reading experience, transliteration support, and audio where available."
        watermark={OM_SYMBOL}
      />
      <PrayersDiscovery
        gayatriSlug={gayatriPrayer?.slug}
        learningPathHref={learningHref}
        learningPathName={featuredLearningDeity}
      />
      <Section
        title="All prayers"
        subtitle="Search, filter, and open prayers without collapsing the reading experience into tiny cards."
      >
        <PrayerLibraryClient
          prayers={prayers}
          deityOptions={deities.map((deity) => deity.name.en)}
        />
      </Section>
      <Section
        title="Guided paths for diaspora families"
        subtitle="Paired stories, symbolism, and ritual guidance by deity."
      >
        <div className="catalog-grid catalog-grid--three" id="learning-paths">
          {learningCards.map((deity) => (
            <article key={deity._id} className="surface-card learning-path-preview">
              <span className="pill pill--soft">Learning path</span>
              <h3>Journey with {deity.name.en}</h3>
              <p>Stories, symbolism, and home ritual context carried in a guided sequence.</p>
              <div className="card-actions">
                <Button
                  tone="secondary"
                  href={`/deities/${deity.slug}/learn`}
                >
                  Open path {"->"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
