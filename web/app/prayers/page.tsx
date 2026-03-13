import { Hero } from "../../components/content/Hero";
import { PrayerCard } from "../../components/content/PrayerCard";
import { Section } from "../../components/content/Section";
import { getPrayers } from "../../lib/data";

export default async function PrayersPage() {
  const prayers = await getPrayers("?limit=108").catch(() => []);

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Prayer library"
        title="Script, meaning, and audio guidance in one devotional library."
        subtitle="Browse sacred prayers designed for daily use across English-speaking and diaspora households."
      />
      <Section title="All prayers" subtitle="The library stays focused on clear access, pronunciation support, and ritual continuity.">
        <div className="content-grid">
          {prayers.map((prayer) => (
            <PrayerCard key={prayer._id} prayer={prayer} />
          ))}
        </div>
      </Section>
    </div>
  );
}
