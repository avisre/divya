import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import type { Puja } from "@/lib/types";

export function PujaCard({ puja, currency = "USD" }: { puja: Puja; currency?: string }) {
  return (
    <article className="surface-card surface-card--warm">
      <div className="surface-card__meta">
        <span className="pill">Temple puja</span>
        <span className="muted">{puja.duration || 0} min</span>
      </div>
      <h3>{puja.name.en}</h3>
      <p>{puja.description?.short || puja.description?.full || "Waitlist-based temple ritual."}</p>
      {puja.deity?.name?.en ? <div className="muted-label">For {puja.deity.name.en}</div> : null}
      <div className="price-line">
        <strong>{formatPrice(puja.displayPrice?.amount, puja.displayPrice?.currency || currency)}</strong>
        <span>{puja.isWaitlistOnly ? "Waitlist only" : "Available now"}</span>
      </div>
      <div className="card-actions">
        <Button href={`/pujas/${puja._id}`}>View puja</Button>
      </div>
    </article>
  );
}
