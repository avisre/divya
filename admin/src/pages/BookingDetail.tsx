import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { AdminBooking, AdminSession } from "../lib/adminApi";
import { getBookingById } from "../lib/adminApi";

type Props = {
  session: AdminSession;
};

export default function BookingDetail({ session }: Props) {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    let active = true;
    setLoading(true);
    setError(null);
    getBookingById(session, bookingId)
      .then((payload) => {
        if (active) setBooking(payload);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load booking");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session, bookingId]);

  return (
    <div>
      <h1>Booking Detail</h1>
      <p>Booking ID: {bookingId}</p>
      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{ color: "#8b2c00" }}>{error}</p> : null}
      {booking ? (
        <div style={{ display: "grid", gap: 8, maxWidth: 760 }}>
          <p><strong>Reference:</strong> {booking.bookingReference}</p>
          <p><strong>Devotee:</strong> {booking.devoteeName}</p>
          <p><strong>Puja:</strong> {booking.puja?.name?.en || "-"}</p>
          <p><strong>Status:</strong> {booking.status}</p>
          <p><strong>Payment:</strong> {booking.paymentStatus}</p>
          <p><strong>Scheduled:</strong> {booking.scheduledDate ? new Date(booking.scheduledDate).toDateString() : "-"} {booking.scheduledTimeIST || ""}</p>
          <p><strong>Video Share URL:</strong> {booking.videoShareUrl || "-"}</p>
        </div>
      ) : null}
    </div>
  );
}
