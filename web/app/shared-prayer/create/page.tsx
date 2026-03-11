import { Hero } from "@/components/content/Hero";
import { Section } from "@/components/content/Section";
import { SharedPrayerCreateForm } from "@/components/forms/SharedPrayerCreateForm";
import { getPrayers } from "@/lib/data";
import { requireSession } from "@/lib/session";

export default async function SharedPrayerCreatePage() {
  await requireSession("/shared-prayer/create");
  const prayers = await getPrayers("?limit=108").catch(() => []);

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Shared prayer"
        title="Create a prayer room for your family."
        subtitle="Choose the prayer, set an auspicious repetition count, and share the session code."
      />
      <Section title="Session setup" subtitle="The shared room stays aligned to the same backend session model used by mobile.">
        <SharedPrayerCreateForm prayers={prayers} />
      </Section>
    </div>
  );
}
