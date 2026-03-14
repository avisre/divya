import type { Metadata } from "next";
import { Hero } from "../../components/content/Hero";
import { MetricGrid } from "../../components/content/MetricGrid";
import { Section } from "../../components/content/Section";
import { BookingsDiscovery } from "../../components/ux/BookingsDiscovery";
import { Button } from "../../components/ui/Button";
import { formatPrice } from "../../lib/format";
import { getBookings, getGiftBookingsReceived, getGiftBookingsSent } from "../../lib/data";
import { getBookingProgressState } from "../../lib/presentation";
import { buildPrivateMetadata } from "../../lib/seo";
import { requireSession } from "../../lib/session";

function bookingTone(status: string) {
  if (status === "completed" || status === "video_ready") return "booking-badge--completed";
  if (status === "confirmed" || status === "in_progress") return "booking-badge--confirmed";
  return "booking-badge--waitlisted";
}

export const metadata: Metadata = buildPrivateMetadata({
  title: "Bookings",
  description: "Private temple booking history, gift activity, and sacred recording status."
});

export default async function BookingsPage() {
  const session = await requireSession("/bookings");
  const [mine, sent, received] = await Promise.all([
    getBookings(session.token).catch(() => []),
    getGiftBookingsSent(session.token).catch(() => []),
    getGiftBookingsReceived(session.token).catch(() => [])
  ]);

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Bookings"
        title="Your sacred record of temple requests, gifts, and recordings."
        subtitle="Bookings should feel like preserved devotional milestones, not support tickets."
        aside={
          <div className="surface-card">
            <h3>Account milestones</h3>
            <MetricGrid
              items={[
                { label: "My bookings", value: `${mine.length}` },
                { label: "Gifts sent", value: `${sent.length}` },
                { label: "Gifts received", value: `${received.length}` }
              ]}
            />
          </div>
        }
      />
      <BookingsDiscovery bookings={mine} />
      <Section
        title="My bookings"
        subtitle="Each booking keeps its devotee details, temple status, and sacred video state together."
      >
        {mine.length ? (
          <div className="catalog-grid">
            {mine.map((booking) => {
              const progress = getBookingProgressState(booking);
              return (
                <article
                  key={booking._id}
                  className={`surface-card booking-card ${
                    booking.status === "video_ready" ? "booking-card--video-ready" : ""
                  }`}
                >
                  <div className="surface-card__meta">
                    <span className={`booking-badge ${bookingTone(booking.status)}`}>{progress.label}</span>
                    <span className="muted">{booking.bookingReference}</span>
                  </div>
                  <h3>{booking.puja?.name.en || booking.bookingReference}</h3>
                  <p>{booking.devoteeName}</p>
                  <p className="muted">{progress.detail}</p>
                  <div className="price-line">
                    <strong>
                      {formatPrice(booking.presentedAmount, booking.presentedCurrency || session.user.currency || "USD")}
                    </strong>
                    <span>{booking.paymentStatus || "pending"}</span>
                  </div>
                  <div className="card-actions">
                    <Button href={booking.status === "video_ready" ? `/bookings/${booking._id}/video` : `/bookings/${booking._id}`}>
                      {progress.cta}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="surface-card empty-state-card">
            <div className="empty-state-card__art">Temple</div>
            <h3>No bookings yet.</h3>
            <p>
              The Bhadra Bhagavathi Temple offers pujas from a simple flower offering to
              a full fire ritual. Your first booking will appear here.
            </p>
            <div className="card-actions">
              <Button href="/pujas">Browse temple offerings {"->"}</Button>
            </div>
          </div>
        )}
      </Section>
      <Section title="Gift activity" subtitle="Gift flows should feel like acts of care, not empty account tables.">
        <div className="content-grid">
          <article className="surface-card">
            <h3>Gifts sent</h3>
            <div className="list-stack">
              {sent.length ? (
                sent.map((booking) => (
                  <div key={booking._id} className="list-row">
                    <span>{booking.puja?.name.en}</span>
                    <span>{getBookingProgressState(booking).label}</span>
                  </div>
                ))
              ) : (
                <div className="empty-invitation">
                  <p>No gifts yet.</p>
                  <span className="muted">
                    {"You can offer any puja in a family member's name. They will receive the sacred video recording."}
                  </span>
                  <Button tone="secondary" href="/pujas">
                    Gift a puja {"->"}
                  </Button>
                </div>
              )}
            </div>
          </article>
          <article className="surface-card">
            <h3>Gifts received</h3>
            <div className="list-stack">
              {received.length ? (
                received.map((booking) => (
                  <div key={booking._id} className="list-row">
                    <span>{booking.puja?.name.en}</span>
                    <span>{getBookingProgressState(booking).label}</span>
                  </div>
                ))
              ) : (
                <div className="empty-invitation">
                  <p>No gifts yet.</p>
                  <span className="muted">
                    Gift a puja to your family. They will receive the sacred video recording when it is ready.
                  </span>
                  <Button tone="secondary" href="/pujas">
                    Browse pujas to gift {"->"}
                  </Button>
                </div>
              )}
            </div>
          </article>
        </div>
      </Section>
    </div>
  );
}
