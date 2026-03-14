import Image from "next/image";
import { BookingVideoPlayer } from "../forms/BookingVideoPlayer";
import { VideoNotificationToggle } from "../forms/VideoNotificationToggle";
import { Button } from "../ui/Button";
import { formatDate } from "../../lib/format";
import { getTempleVisual } from "../../lib/presentation";
import type { PujaBooking, UserSession } from "../../lib/types";

type BookingVideoPayload = {
  url?: string | null;
  shareUrl?: string | null;
  thumbnailUrl?: string | null;
};

function getPerformedLabel(booking: PujaBooking) {
  if (booking.scheduledDate) {
    return formatDate(booking.scheduledDate);
  }
  return formatDate(booking.createdAt);
}

function getVideoState(booking: PujaBooking, video: BookingVideoPayload | null) {
  if (booking.puja?.videoDelivered === false) {
    return "unavailable" as const;
  }

  if (booking.status === "video_ready" && video?.url) {
    return "ready" as const;
  }

  return "processing" as const;
}

export function SacredVideoExperience({
  booking,
  user,
  video
}: {
  booking: PujaBooking;
  user: UserSession;
  video: BookingVideoPayload | null;
}) {
  const videoState = getVideoState(booking, video);
  const templeVisual = getTempleVisual(booking.temple || booking.puja?.temple);
  const pujaTitle = booking.puja?.name.en || "Temple puja";
  const performedLabel = getPerformedLabel(booking);

  if (videoState === "ready") {
    return (
      <div className="surface-card sacred-video-card">
        <p className="eyebrow">Sacred video</p>
        <h2>{pujaTitle}</h2>
        <p className="muted">
          Performed by the Tantri of Bhadra Bhagavathi Temple on {performedLabel}.
        </p>
        <BookingVideoPlayer
          bookingId={booking._id}
          src={video?.url || ""}
          poster={video?.thumbnailUrl || templeVisual.src}
        />
        <div className="sacred-video-card__privacy">
          Privacy: This video is private to your account. It cannot be shared by URL.
        </div>
        <div className="card-actions">
          <Button href={`/api/bookings/${booking._id}/video/download`}>Download for family archive {"->"}</Button>
          <Button tone="secondary" href={booking.puja ? `/pujas/${booking.puja._id}?gift=1` : "/pujas"}>
            Gift this puja to a family member {"->"}
          </Button>
          <Button tone="ghost" href="/bookings">
            Back to bookings
          </Button>
        </div>
      </div>
    );
  }

  if (videoState === "unavailable") {
    return (
      <div className="surface-card sacred-video-card sacred-video-card--supporting">
        <div className="sacred-video-card__illustration">
          <Image src={templeVisual.src} alt={templeVisual.alt} width={420} height={260} />
        </div>
        <div className="page-stack">
          <p className="eyebrow">Sacred video</p>
          <h2>No private recording is attached to this offering.</h2>
          <p>
            Some puja types include a private HD recording and others do not. This offering is preserved
            in your devotional record, but it does not carry a downloadable temple video.
          </p>
          <div className="card-actions">
            <Button href="/pujas">Browse pujas that include video {"->"}</Button>
            <Button tone="ghost" href="/bookings">
              Back to bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card sacred-video-card sacred-video-card--supporting">
      <div className="sacred-video-card__illustration">
        <Image src={templeVisual.src} alt={templeVisual.alt} width={420} height={260} />
      </div>
      <div className="page-stack">
        <p className="eyebrow">Sacred video</p>
        <h2>Your puja was performed on {performedLabel}.</h2>
        <p>
          The recording is being prepared. It will appear here within 48 hours once the temple video
          is processed and attached to this booking.
        </p>
        <div className="lotus-loader" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <VideoNotificationToggle user={user} />
        <div className="card-actions">
          <Button tone="secondary" href="/bookings">
            Back to bookings
          </Button>
        </div>
      </div>
    </div>
  );
}
