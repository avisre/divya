import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "../../../components/content/Hero";
import { Section } from "../../../components/content/Section";
import { SharedPrayerClient } from "../../../components/forms/SharedPrayerClient";
import { getSharedPrayerSession } from "../../../lib/data";
import { buildPrivateMetadata } from "../../../lib/seo";
import { requireSession } from "../../../lib/session";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Shared prayer room",
  description: "Private live family prayer room with shared repetition counting and WhatsApp invite flow."
});

export default async function SharedPrayerPage({
  params,
  searchParams
}: {
  params: Promise<{ sessionCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionCode } = await params;
  const resolvedSearch = await searchParams;
  const session = await requireSession(`/shared-prayer/${sessionCode}`);
  const sharedPrayer = await getSharedPrayerSession(sessionCode, session.token).catch(() => null);

  if (!sharedPrayer) {
    notFound();
  }

  const prayerTitle =
    typeof sharedPrayer.prayerId === "string"
      ? "Shared family prayer"
      : sharedPrayer.prayerId.title.en;
  const expectedOthers = Number(Array.isArray(resolvedSearch.expected) ? resolvedSearch.expected[0] : resolvedSearch.expected || 0);

  return (
    <div className="page-stack">
      <Hero
        variant="shared"
        eyebrow={`Session ${sharedPrayer.sessionCode}`}
        title={prayerTitle}
        subtitle="A live family room for shared repetition, steady presence, and one count carried together."
      />
      <Section title="Live room" subtitle="The room should feel devotional and familial rather than like a meeting dashboard.">
        <SharedPrayerClient initialSession={sharedPrayer} user={session.user} expectedOthers={expectedOthers} />
      </Section>
    </div>
  );
}
