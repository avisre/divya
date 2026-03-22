import { Button } from "../ui/Button";
import { formatPrice, formatPujaAvailability } from "../../lib/format";
import { getDeityThemeStyle, getPujaPreview } from "../../lib/presentation";
import type { Puja } from "../../lib/types";

export function PujaCard({ puja, currency = "GBP" }: { puja: Puja; currency?: string }) {
  const deityName = puja.deity?.name?.en || puja.name.en;
  const isStarterPuja = /abhishekam/i.test(puja.name.en);

  return (
    <article
      data-testid="puja-card"
      data-guided-target={isStarterPuja ? "starter-puja-card" : undefined}
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
        <strong data-testid="puja-price">{formatPrice(puja.displayPrice?.amount, puja.displayPrice?.currency || currency)}</strong>
        <span>{puja.isWaitlistOnly ? "Join sacred waitlist ->" : "Available now"}</span>
      </div>
      <p className="muted">Availability: {formatPujaAvailability(puja.estimatedWaitWeeks)}</p>
      <p className="muted">48-hour video delivery after the ceremony is completed.</p>
      <div className="puja-card__pill-row">
        <span className="pill pill--muted">{puja.duration || 0} min</span>
      </div>
      <div className="card-actions">
        <Button href={`/pujas/${puja._id}`}>View puja</Button>
      </div>
    </article>
  );
}
