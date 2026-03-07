import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { bookingApi } from "@/lib/api";
import { HeroSection, SectionCard, StatusStrip } from "@/components/ui/Surface";

export default function BookingsPage() {
  const [tab, setTab] = useState<"mine" | "sent" | "received">("mine");
  const mine = useQuery({ queryKey: ["bookings"], queryFn: () => bookingApi.list() });
  const sent = useQuery({ queryKey: ["gifts-sent"], queryFn: () => bookingApi.giftsSent(), enabled: tab === "sent" });
  const received = useQuery({
    queryKey: ["gifts-received"],
    queryFn: () => bookingApi.giftsReceived(),
    enabled: tab === "received"
  });

  const rows = tab === "mine" ? mine.data : tab === "sent" ? sent.data : received.data;

  return (
    <div className="page-stack">
      <HeroSection eyebrow="My Pujas" title="Track bookings, gifts, and sacred videos" subtitle="Statuses here reflect the real booking workflow, not local placeholders." />
      <SectionCard title="Booking history">
        <div className="chip-row">
          {[
            ["mine", "My bookings"],
            ["sent", "Gifts sent"],
            ["received", "Gifts received"]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`filter-chip ${tab === value ? "active" : ""}`}
              onClick={() => setTab(value as "mine" | "sent" | "received")}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="list-stack">
          {rows?.map((booking) => (
            <article key={booking._id} className="content-card horizontal-card">
              <div>
                <div className="eyebrow">{booking.status}</div>
                <h3>{booking.puja?.name.en || booking.bookingReference}</h3>
                <p>
                  {booking.bookingReference} | {booking.devoteeName}
                </p>
              </div>
              <div className="card-meta right-align">
                <span>{booking.presentedCurrency} {booking.presentedAmount}</span>
                <Link className="text-link" to={`/bookings/${booking._id}`}>
                  Open
                </Link>
              </div>
            </article>
          ))}
        </div>
        {!rows?.length ? <StatusStrip tone="neutral">No records yet for this tab.</StatusStrip> : null}
      </SectionCard>
    </div>
  );
}
