import { describe, expect, it } from "vitest";
import {
  buildStaticBillingCatalog,
  formatBillingPrice,
  getBillingPrice
} from "../../lib/subscription-plans";

describe("subscription plans", () => {
  it("includes annual pricing for paid plans", () => {
    const catalog = buildStaticBillingCatalog();
    const bhakt = catalog.plans.find((plan) => plan.tier === "bhakt");
    const seva = catalog.plans.find((plan) => plan.tier === "seva");

    expect(bhakt?.prices.year?.amountCents).toBe(4999);
    expect(seva?.prices.year?.amountCents).toBe(12999);
  });

  it("formats the displayed monthly price", () => {
    const catalog = buildStaticBillingCatalog();
    const bhakt = catalog.plans.find((plan) => plan.tier === "bhakt");
    const price = bhakt ? getBillingPrice(bhakt, "month") : null;

    expect(price).not.toBeNull();
    expect(formatBillingPrice(price!)).toBe("£4.99");
  });
});
