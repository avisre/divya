import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { bookingApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";
import { friendlyDate } from "@/lib/time";

export default function BookingDetailPage() {
  const { id = "" } = useParams();
  const booking = useQuery({ queryKey: ["booking-detail", id], queryFn: () => bookingApi.detail(id), enabled: Boolean(id) });
  const cancelMutation = useMutation({
    mutationFn: () => bookingApi.cancel(id),
    onSuccess: () => booking.refetch()
  });

  if (!booking.data) {
    return <div className="page-state">Loading booking...</div>;
  }

  return (
    <div className="page-stack">
      <HeroSection
        eyebrow={booking.data.status}
        title={booking.data.puja?.name.en || booking.data.bookingReference}
        subtitle={`Reference ${booking.data.bookingReference}`}
      />

      <SectionCard title="Booking details">
        <div className="bullet-grid">
          <div>
            <strong>Devotee</strong>
            <p>{booking.data.devoteeName}</p>
          </div>
          <div>
            <strong>Gothram</strong>
            <p>{booking.data.gothram || "Unknown"}</p>
          </div>
          <div>
            <strong>Nakshatra</strong>
            <p>{booking.data.nakshatra || "Not provided"}</p>
          </div>
          <div>
            <strong>Created</strong>
            <p>{friendlyDate(booking.data.createdAt)}</p>
          </div>
        </div>
        <p>{booking.data.prayerIntention}</p>
      </SectionCard>

      <SectionCard title="Booking status">
        <StatusStrip tone={booking.data.status === "cancelled" ? "warning" : "success"}>
          {booking.data.status} | payment {booking.data.paymentStatus}
        </StatusStrip>
        {booking.data.status === "video_ready" ? (
          <Link className="btn btn-primary" to={`/videos/${booking.data._id}`}>
            Watch sacred video
          </Link>
        ) : null}
        {booking.data.status !== "cancelled" ? (
          <Button tone="secondary" onClick={() => cancelMutation.mutate()}>
            Cancel booking
          </Button>
        ) : null}
      </SectionCard>
    </div>
  );
}
