import { Hero } from "../../components/content/Hero";
import { MetricGrid } from "../../components/content/MetricGrid";
import { Section } from "../../components/content/Section";
import { Button } from "../../components/ui/Button";
import { formatPrice } from "../../lib/format";
import { getBookings, getGiftBookingsReceived, getGiftBookingsSent } from "../../lib/data";
import { requireSession } from "../../lib/session";

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
        title="Track temple requests, gifts, and sacred videos."
        subtitle="All statuses here come from the live booking pipeline, not a local placeholder."
        aside={
          <div className="surface-card">
            <h3>Account-wide view</h3>
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
      <Section title="My bookings" subtitle="Every booking keeps its devotee details, status, and video state in one place.">
        <div className="content-grid">
          {mine.map((booking) => (
            <article key={booking._id} className="surface-card surface-card--feature">
              <div className="surface-card__meta">
                <span className="pill">{booking.status}</span>
                <span className="muted">{booking.bookingReference}</span>
              </div>
              <h3>{booking.puja?.name.en || booking.bookingReference}</h3>
              <p>{booking.devoteeName}</p>
              <div className="price-line">
                <strong>{formatPrice(booking.presentedAmount, booking.presentedCurrency || session.user.currency || "USD")}</strong>
                <span>{booking.paymentStatus || "pending"}</span>
              </div>
              <div className="card-actions">
                <Button href={`/bookings/${booking._id}`}>Open booking</Button>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Gift activity" subtitle="Sent and received offerings remain visible so family coordination is not lost.">
        <div className="content-grid">
          <article className="surface-card">
            <h3>Gifts sent</h3>
            <div className="list-stack">
              {sent.length ? sent.map((booking) => <div key={booking._id} className="list-row"><span>{booking.puja?.name.en}</span><span>{booking.status}</span></div>) : <p>No gifts sent yet.</p>}
            </div>
          </article>
          <article className="surface-card">
            <h3>Gifts received</h3>
            <div className="list-stack">
              {received.length ? received.map((booking) => <div key={booking._id} className="list-row"><span>{booking.puja?.name.en}</span><span>{booking.status}</span></div>) : <p>No gifts received yet.</p>}
            </div>
          </article>
        </div>
      </Section>
    </div>
  );
}
