import Link from "next/link";
import { formatBillingPrice, getBillingPriceForTier } from "../../lib/subscription-plans";

const bhaktPrice =
  getBillingPriceForTier("bhakt", "month") &&
  formatBillingPrice(getBillingPriceForTier("bhakt", "month")!);

export function LearnPaywall() {
  return (
    <aside data-testid="learn-paywall" className="surface-card learn-paywall">
      <div className="surface-card__meta">
        <span className="pill pill--soft">Bhakt library</span>
        <span className="muted">{bhaktPrice || "£4.99"} / month</span>
      </div>
      <h3>Continue reading with Bhakt</h3>
      <p>
        Bhakt unlocks deeper reading on deities, festivals, customs, and Kerala temple traditions -
        in the same calm format as the prayer library.
      </p>
      <div className="card-actions">
        <Link
          data-testid="learn-paywall-cta"
          href="/plans?highlight=bhakt"
          className="button button--primary"
        >
          Unlock with Bhakt - {bhaktPrice || "£4.99"}/mo
        </Link>
        <Link href="/plans" className="inline-link">
          See what&apos;s included in Bhakt
        </Link>
      </div>
    </aside>
  );
}
