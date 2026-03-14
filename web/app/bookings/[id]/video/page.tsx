import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "../../../../components/content/Hero";
import { SacredVideoExperience } from "../../../../components/content/SacredVideoExperience";
import { Section } from "../../../../components/content/Section";
import { getBooking, getBookingVideo } from "../../../../lib/data";
import { buildPrivateMetadata } from "../../../../lib/seo";
import { requireSession } from "../../../../lib/session";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Sacred video",
  description: "Private temple recording for a completed puja booking."
});

export default async function BookingVideoPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession(`/bookings/${id}/video`);
  const [booking, video] = await Promise.all([
    getBooking(id, session.token).catch(() => null),
    getBookingVideo(id, session.token).catch(() => null)
  ]);

  if (!booking) {
    notFound();
  }

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Sacred video"
        title={`Temple recording for ${booking.puja?.name.en || booking.bookingReference}`}
        subtitle="This recording remains private to your authenticated account and is regenerated with a fresh signed link on each page load."
      />
      <Section title="Private playback" subtitle="Sacred videos should feel like part of the booking record, not a detached media page.">
        <SacredVideoExperience booking={booking} user={session.user} video={video} />
      </Section>
    </div>
  );
}
