import type { BillingCatalog, BillingInterval, BillingPlan, BillingPriceOption, Subscription } from "./types";

const planDefinitions: BillingPlan[] = [
  {
    tier: "free",
    name: "Free",
    summary: "For new devotees exploring prayer, panchang, and the temple story.",
    badge: null,
    cta: "Start free",
    footnote: "Best for first-time exploration with no pressure.",
    perks: [
      "Daily panchang and temple context",
      "10 complete prayers with audio where available",
      "One active puja waitlist at a time"
    ],
    prices: {}
  },
  {
    tier: "bhakt",
    name: "Bhakt",
    summary: "For devotees building a consistent daily practice and deeper temple connection.",
    badge: "Most popular",
    cta: "Choose Bhakt",
    footnote: "Best for building a daily spiritual habit.",
    perks: [
      "54 guided prayers unlocked",
      "Bundled audio where available",
      "Unlimited waitlists with priority scheduling"
    ],
    prices: {
      month: {
        amountCents: 499,
        currency: "usd",
        interval: "month",
        envKey: "STRIPE_BHAKT_MONTHLY_PRICE_ID",
        lookupKey: "prarthana_bhakt_monthly",
        priceId: null,
        active: false
      },
      year: {
        amountCents: 4999,
        currency: "usd",
        interval: "year",
        envKey: "STRIPE_BHAKT_ANNUAL_PRICE_ID",
        lookupKey: "prarthana_bhakt_annual",
        savingsLabel: "Save 17% annually",
        priceId: null,
        active: false
      }
    }
  },
  {
    tier: "seva",
    name: "Seva",
    summary: "For families who want a long-term sacred archive and premium temple access.",
    badge: "Best for families",
    cta: "Choose Seva",
    footnote: "Best for preserving pujas as a family keepsake.",
    perks: [
      "Everything in Bhakt",
      "108-prayer full library",
      "Sacred video archive and downloads",
      "Early access to new puja types"
    ],
    prices: {
      month: {
        amountCents: 1299,
        currency: "usd",
        interval: "month",
        envKey: "STRIPE_SEVA_MONTHLY_PRICE_ID",
        lookupKey: "prarthana_seva_monthly",
        priceId: null,
        active: false
      },
      year: {
        amountCents: 12999,
        currency: "usd",
        interval: "year",
        envKey: "STRIPE_SEVA_ANNUAL_PRICE_ID",
        lookupKey: "prarthana_seva_annual",
        savingsLabel: "Save 17% annually",
        priceId: null,
        active: false
      }
    }
  }
];

export function buildStaticBillingCatalog(): BillingCatalog {
  return {
    enabled: false,
    subscriptionsConfigured: false,
    plans: planDefinitions
  };
}

export function formatBillingPrice(price: BillingPriceOption) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency.toUpperCase(),
    minimumFractionDigits: 2
  });
  return formatter.format(price.amountCents / 100);
}

export function getBillingPrice(plan: BillingPlan, interval: BillingInterval) {
  return plan.prices?.[interval] || null;
}

export function getSubscriptionLabel(subscription?: Subscription | null) {
  if (!subscription || subscription.tier === "free") {
    return "Free";
  }
  return subscription.tier === "bhakt" ? "Bhakt" : "Seva";
}

export function canManageSubscription(subscription?: Subscription | null) {
  return Boolean(
    subscription?.tier &&
      subscription.tier !== "free" &&
      subscription.stripeCustomerId &&
      subscription.stripeSubscriptionId
  );
}
