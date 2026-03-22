import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingConfirmationActions } from "../../../components/content/BookingConfirmationActions";
import { Hero } from "../../../components/content/Hero";
import { Section } from "../../../components/content/Section";
import { Button } from "../../../components/ui/Button";
import { formatDate } from "../../../lib/format";
import { getBooking } from "../../../lib/data";
import { SITE_URL } from "../../../lib/env";
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

  const shareUrl = `${SITE_URL}/bookings/${booking._id}`;
  const pujaName = booking.puja?.name.en || booking.bookingReference;
  const honouredName = booking.giftDetails?.recipientName || booking.devoteeName;
  const whatsappMessage = `A ${pujaName} has been offered at Bhadra Bhagavathi Temple in our family's name. - via Prarthana`;
  const userTier = session.user.subscription?.tier || "free";

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Booking confirmation"
        title="Your offering has been received."
        subtitle={`Reference ${booking.bookingReference}`}
      />
      <Section title="Ceremony confirmation" subtitle="Your temple request is preserved here as part of the family record.">
        <div className="surface-card booking-confirmation-card">
          <div data-testid="booking-ceremony-card">
          <h3>{pujaName}</h3>
          <div className="booking-confirmation-card__meta">
            <span>Bhadra Bhagavathi Temple, Karunagapally</span>
            <span>Booked in the name of: {honouredName}</span>
            <span>Estimated wait: within 7 days</span>
            <span>Video delivery: within 48h of ceremony</span>
          </div>
          </div>
        </div>

        <div className="surface-card booking-confirmation-copy">
          <p>
            The temple has received your request and it will join the real ceremony queue. You will
            receive a confirmation message with your ceremony date within 24 hours. When the ceremony
            is complete, your sacred video will appear in your account.
          </p>
        </div>

        <div className="surface-card booking-confirmation-copy">
          <h3>Share with family</h3>
          <p>Let your family know a puja has been booked in their name.</p>
          <BookingConfirmationActions shareUrl={shareUrl} whatsappMessage={whatsappMessage} />
        </div>

        <div className="surface-card booking-confirmation-copy">
          <h3>While you wait</h3>
          <p>Begin today&apos;s prayers while your puja is scheduled.</p>
          <div className="card-actions">
            <Button href="/prayers">Open prayer library {"->"}</Button>
          </div>
        </div>

        {userTier === "free" ? (
          <div data-testid="confirmation-seva-prompt" className="surface-card booking-confirmation-copy booking-confirmation-copy--accent">
            <h3>Keep the sacred video in your archive</h3>
            <p>
              Your ceremony will be performed, and a recording of it can be delivered to your account
              with Seva.
            </p>
            <div className="card-actions">
              <Button href="/plans?highlight=seva">Learn about Seva {"->"}</Button>
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
          {booking.status === "video_ready" ? <Button href={`/bookings/${booking._id}/video`}>Open sacred video</Button> : null}
          <Button tone="secondary" href="/bookings">Back to bookings</Button>
          <Button tone="ghost" href={`/contact?bookingReference=${encodeURIComponent(booking.bookingReference)}`}>
            Contact support
          </Button>
        </div>
        <p className="muted">Booked on {formatDate(booking.createdAt)}</p>
      </Section>
    </div>
  );
}
