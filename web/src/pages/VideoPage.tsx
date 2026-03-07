import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { bookingApi } from "@/lib/api";
import { HeroSection, SectionCard } from "@/components/ui/Surface";

export default function VideoPage() {
  const { bookingId = "" } = useParams();
  const [watched, setWatched] = useState(false);
  const video = useQuery({ queryKey: ["booking-video", bookingId], queryFn: () => bookingApi.video(bookingId), enabled: Boolean(bookingId) });

  useEffect(() => {
    if (video.data?.url && !watched) {
      void bookingApi.markWatched(bookingId);
      setWatched(true);
    }
  }, [bookingId, video.data?.url, watched]);

  return (
    <div className="page-stack">
      <HeroSection eyebrow="Sacred video" title="Watch your temple recording" subtitle="This recording is delivered through the authenticated booking flow." />
      <SectionCard title="Video player">
        {video.data?.url ? (
          <video className="video-frame" src={video.data.url} controls playsInline />
        ) : (
          <div className="page-state">Preparing the video...</div>
        )}
      </SectionCard>
    </div>
  );
}
