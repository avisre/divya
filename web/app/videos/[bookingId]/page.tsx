import { Hero } from "../../../components/content/Hero";
import { Section } from "../../../components/content/Section";
import { Button } from "../../../components/ui/Button";
import { getBookingVideo } from "../../../lib/data";
import { requireSession } from "../../../lib/session";

export default async function VideoPage({
  params
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const session = await requireSession(`/videos/${bookingId}`);
  const video = await getBookingVideo(bookingId, session.token).catch(() => null);

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Sacred video"
        title="Watch your temple recording."
        subtitle="This video remains private to your authenticated account."
      />
      <Section title="Video player" subtitle="Playback is tied directly to the booking that produced it.">
        <div className="surface-card">
          {video?.url ? (
            <video className="audio-player" src={video.url} controls playsInline />
          ) : (
            <p>Your video is still being prepared.</p>
          )}
          <div className="card-actions">
            <Button tone="secondary" href="/bookings">Back to bookings</Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
