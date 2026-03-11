import { notFound } from "next/navigation";
import { Hero } from "@/components/content/Hero";
import { Section } from "@/components/content/Section";
import { PrayerDetailClient } from "@/components/forms/PrayerDetailClient";
import { getPrayer, getPrayerAudio } from "@/lib/data";
import { getOptionalSession } from "@/lib/session";

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

  return (
    <div className="page-stack">
      <Hero
        eyebrow={`${prayer.type} • ${prayer.difficulty}`}
        title={prayer.title.en}
        subtitle={prayer.beginnerNote || prayer.meaning || "A guided devotional prayer."}
      />
      <Section title="Prayer experience" subtitle="Read, listen, and save the prayer from one surface.">
        <PrayerDetailClient prayer={prayer} audio={audio} isAuthenticated={Boolean(session)} />
      </Section>
    </div>
  );
}
