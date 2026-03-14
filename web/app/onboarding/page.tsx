import type { Metadata } from "next";
import { Hero } from "../../components/content/Hero";
import { Section } from "../../components/content/Section";
import { OnboardingFlow } from "../../components/ux/OnboardingFlow";
import { getDeities, getPrayers } from "../../lib/data";
import { buildPrivateMetadata } from "../../lib/seo";
import { requireSession } from "../../lib/session";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Onboarding",
  description: "Private onboarding flow for timezone, deity preferences, and the first devotional practice."
});

export default async function OnboardingPage() {
  const session = await requireSession("/onboarding");
  const [prayers, deities] = await Promise.all([
    getPrayers("?limit=108").catch(() => []),
    getDeities().catch(() => [])
  ]);

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Welcome"
        title="Set the devotional rhythm for your home."
        subtitle="A short setup keeps the temple's timing, your family deity, and the first prayer aligned from the beginning."
      />
      <Section title="Begin gently" subtitle="Three small steps, then one real prayer. No verification detour before the app proves its value.">
        <OnboardingFlow
          prayers={prayers}
          deities={deities}
          userName={session.user.name}
          defaultCountry={session.user.country || "US"}
          defaultTimezone={session.user.timezone || "America/New_York"}
        />
      </Section>
    </div>
  );
}
