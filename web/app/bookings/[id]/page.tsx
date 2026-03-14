import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "../../../components/content/Hero";
import { Section } from "../../../components/content/Section";
import { Button } from "../../../components/ui/Button";
import { formatDate, formatPrice } from "../../../lib/format";
import { getBooking } from "../../../lib/data";
import { getBookingProgressState } from "../../../lib/presentation";
import { buildPrivateMetadata } from "../../../lib/seo";
import { requireSession } from "../../../lib/session";

export const metadata: Metadata = buildPrivateMetadata({
  title: "Booking details",
  description: "Private temple booking details, waitlist status, and sacred recording progress."
});

export default async function BookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession(`/bookings/${id}`);
  const booking = await getBooking(id, session.token).catch(() => null);

  if (!booking) {
    notFound();
  }

  const progress = getBookingProgressState(booking);

  return (
    <div className="page-stack">
      <Hero
        eyebrow={progress.label}
        title={booking.puja?.name.en || booking.bookingReference}
        subtitle={`Reference ${booking.bookingReference}`}
      />
      <Section title="Booking details" subtitle="These details are preserved as part of your temple record.">
        <div className="content-grid">
          <div className="surface-card">
            <h3>Devotee details</h3>
            <div className="list-stack">
              <div className="list-row"><span>Name</span><span>{booking.devoteeName}</span></div>
              <div className="list-row"><span>Gothram</span><span>{booking.gothram || "Not provided"}</span></div>
              <div className="list-row"><span>Nakshatra</span><span>{booking.nakshatra || "Not provided"}</span></div>
              <div className="list-row"><span>Created</span><span>{formatDate(booking.createdAt)}</span></div>
            </div>
          </div>
          <div className="surface-card">
            <h3>Status</h3>
            <div className="list-stack">
              <div className="list-row"><span>Booking status</span><span>{progress.label}</span></div>
              <div className="list-row"><span>Payment</span><span>{booking.paymentStatus || "pending"}</span></div>
              <div className="list-row"><span>Amount</span><span>{formatPrice(booking.presentedAmount, booking.presentedCurrency || session.user.currency || "USD")}</span></div>
              <div className="list-row"><span>Waitlist position</span><span>{booking.waitlistPosition || "-"}</span></div>
            </div>
            <p className="muted">{progress.detail}</p>
          </div>
        </div>
        {booking.waitlistPosition ? (
          <div className="discovery-banner discovery-banner--gold">
            <strong>You are position {booking.waitlistPosition} on the waitlist.</strong>
            <p>
              The temple typically confirms pujas within 2-3 weeks. You will receive an
              email when your date is assigned. There is nothing more you need to do.
            </p>
            <div className="card-actions">
              <Button
                tone="secondary"
                href={`/contact?bookingReference=${encodeURIComponent(booking.bookingReference)}`}
              >
                Contact support about this booking {"->"}
              </Button>
            </div>
          </div>
        ) : null}
        {booking.prayerIntention ? (
          <div className="surface-card">
            <h3>Prayer intention</h3>
            <p>{booking.prayerIntention}</p>
          </div>
        ) : null}
        <div className="card-actions">
          {booking.status === "video_ready" ? <Button href={`/bookings/${booking._id}/video`}>{progress.cta}</Button> : null}
          <Button tone="secondary" href="/bookings">Back to bookings</Button>
        </div>
      </Section>
    </div>
  );
}
