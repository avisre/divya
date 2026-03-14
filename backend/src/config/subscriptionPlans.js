const BASE_CURRENCY = "usd";

export const SUBSCRIPTION_INTERVALS = {
  MONTH: "month",
  YEAR: "year"
};

export const SUBSCRIPTION_PLAN_DEFINITIONS = {
  free: {
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
  bhakt: {
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
      [SUBSCRIPTION_INTERVALS.MONTH]: {
        amountCents: 499,
        currency: BASE_CURRENCY,
        envKey: "STRIPE_BHAKT_MONTHLY_PRICE_ID",
        lookupKey: "prarthana_bhakt_monthly"
      },
      [SUBSCRIPTION_INTERVALS.YEAR]: {
        amountCents: 4999,
        currency: BASE_CURRENCY,
        envKey: "STRIPE_BHAKT_ANNUAL_PRICE_ID",
        lookupKey: "prarthana_bhakt_annual",
        savingsLabel: "Save 17% annually"
      }
    }
  },
  seva: {
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
      [SUBSCRIPTION_INTERVALS.MONTH]: {
        amountCents: 1299,
        currency: BASE_CURRENCY,
        envKey: "STRIPE_SEVA_MONTHLY_PRICE_ID",
        lookupKey: "prarthana_seva_monthly"
      },
      [SUBSCRIPTION_INTERVALS.YEAR]: {
        amountCents: 12999,
        currency: BASE_CURRENCY,
        envKey: "STRIPE_SEVA_ANNUAL_PRICE_ID",
        lookupKey: "prarthana_seva_annual",
        savingsLabel: "Save 17% annually"
      }
    }
  }
};

export function getSubscriptionPlanCatalog() {
  return Object.values(SUBSCRIPTION_PLAN_DEFINITIONS).map((plan) => ({
    ...plan,
    prices: Object.fromEntries(
      Object.entries(plan.prices || {}).map(([interval, price]) => [
        interval,
        {
          ...price,
          priceId: process.env[price.envKey] || null,
          active: Boolean(process.env[price.envKey])
        }
      ])
    )
  }));
}

export function getSubscriptionPlan(tier) {
  return SUBSCRIPTION_PLAN_DEFINITIONS[tier] || null;
}

export function getSubscriptionPriceId(tier, interval) {
  const plan = getSubscriptionPlan(tier);
  if (!plan?.prices?.[interval]) return null;
  return process.env[plan.prices[interval].envKey] || null;
}

export function resolveSubscriptionPlanFromPriceId(priceId) {
  const normalized = String(priceId || "").trim();
  if (!normalized) return null;

  for (const plan of Object.values(SUBSCRIPTION_PLAN_DEFINITIONS)) {
    for (const [interval, price] of Object.entries(plan.prices || {})) {
      if ((process.env[price.envKey] || "").trim() === normalized) {
        return {
          tier: plan.tier,
          interval,
          ...price
        };
      }
    }
  }

  return null;
}
