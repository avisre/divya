import { Button } from "../ui/Button";
import { formatPrice } from "../../lib/format";
import { getDeityThemeStyle, getPujaPreview } from "../../lib/presentation";
import type { Puja } from "../../lib/types";

export function PujaCard({ puja, currency = "USD" }: { puja: Puja; currency?: string }) {
  const deityName = puja.deity?.name?.en || puja.name.en;

  return (
    <article
      className="surface-card surface-card--warm puja-card"
      style={getDeityThemeStyle(deityName)}
    >
      <div className="surface-card__meta puja-card__meta">
        <span className="pill pill--soft">Temple puja</span>
        <span className="muted">{puja.duration || 0} min</span>
      </div>
      <h3>{puja.name.en}</h3>
      <p>{getPujaPreview(puja)}</p>
      {puja.deity?.name?.en ? <div className="muted-label">For {puja.deity.name.en}</div> : null}
      <div className="price-line">
        <strong>{formatPrice(puja.displayPrice?.amount, puja.displayPrice?.currency || currency)}</strong>
        <span>{puja.isWaitlistOnly ? "Join sacred waitlist ->" : "Available now"}</span>
      </div>
      {typeof puja.waitlistCount === "number" && puja.waitlistCount > 0 ? (
        <p className="muted">{puja.waitlistCount} families have booked this offering.</p>
      ) : null}
      <div className="puja-card__pill-row">
        <span className="pill pill--muted">{puja.duration || 0} min</span>
      </div>
      <div className="card-actions">
        <Button href={`/pujas/${puja._id}`}>View puja</Button>
      </div>
    </article>
  );
}
