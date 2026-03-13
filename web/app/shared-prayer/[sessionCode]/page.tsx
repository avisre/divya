import { notFound } from "next/navigation";
import { Hero } from "../../../components/content/Hero";
import { Section } from "../../../components/content/Section";
import { SharedPrayerClient } from "../../../components/forms/SharedPrayerClient";
import { getSharedPrayerSession } from "../../../lib/data";
import { requireSession } from "../../../lib/session";

export default async function SharedPrayerPage({
  params
}: {
  params: Promise<{ sessionCode: string }>;
}) {
  const { sessionCode } = await params;
  const session = await requireSession(`/shared-prayer/${sessionCode}`);
  const sharedPrayer = await getSharedPrayerSession(sessionCode, session.token).catch(() => null);

  if (!sharedPrayer) {
    notFound();
  }

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Shared prayer"
        title={`Session ${sharedPrayer.sessionCode}`}
        subtitle={`Status: ${sharedPrayer.status}`}
      />
      <Section title="Live room" subtitle="Participants, repetition count, and session events stay together here.">
        <SharedPrayerClient initialSession={sharedPrayer} user={session.user} />
      </Section>
    </div>
  );
}
