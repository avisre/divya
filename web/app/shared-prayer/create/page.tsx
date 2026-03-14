import type { Metadata } from "next";
import { Hero } from "../../../components/content/Hero";
import { Section } from "../../../components/content/Section";
import { SharedPrayerCreateForm } from "../../../components/forms/SharedPrayerCreateForm";
import { getPrayers } from "../../../lib/data";
import { buildPrivateMetadata } from "../../../lib/seo";
import { requireSession } from "../../../lib/session";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Create shared prayer",
  description: "Private family prayer room setup with prayer selection and repetition count."
});

export default async function SharedPrayerCreatePage() {
  await requireSession("/shared-prayer/create");
  const prayers = await getPrayers("?limit=108").catch(() => []);

  return (
    <div className="page-stack">
      <Hero
        variant="shared"
        eyebrow="Shared prayer"
        title="Create a prayer room and share one sacred count with your family."
        subtitle="Choose the prayer deliberately, select an auspicious repetition count, and share the session code like an offering."
      />
      <Section title="Session setup" subtitle="Prayer choice and repetition count should feel intentional, not buried in generic form controls.">
        <SharedPrayerCreateForm prayers={prayers} />
      </Section>
    </div>
  );
}
