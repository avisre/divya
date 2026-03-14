"use client";

import { useRef, useState } from "react";
import { sendJson } from "../../lib/client-api";
import { useUx } from "../ux/UxProvider";

export function BookingVideoPlayer({
  bookingId,
  src,
  poster
}: {
  bookingId: string;
  src: string;
  poster?: string;
}) {
  const hasTrackedRef = useRef(false);
  const [status, setStatus] = useState("");
  const { markVideoWatched } = useUx();

  async function markWatched() {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    try {
      await sendJson(`/api/backend/bookings/${bookingId}/video/watched`, {
        method: "POST",
        body: JSON.stringify({})
      });
      markVideoWatched(bookingId);
      setStatus("Watched state saved to your devotional record.");
    } catch (error) {
      hasTrackedRef.current = false;
      setStatus(error instanceof Error ? error.message : "Unable to save watched state.");
    }
  }

  return (
    <div className="page-stack sacred-video-player">
      <video
        className="sacred-video-player__media"
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        onPlay={markWatched}
        onEnded={markWatched}
      />
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}
