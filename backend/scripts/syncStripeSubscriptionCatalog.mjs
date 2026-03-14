import "dotenv/config";
import Stripe from "stripe";
import {
  SUBSCRIPTION_PLAN_DEFINITIONS,
  SUBSCRIPTION_INTERVALS
} from "../src/config/subscriptionPlans.js";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function findOrCreateProduct(plan) {
  const products = await stripe.products.list({ active: true, limit: 100 });
  const existing =
    products.data.find((item) => item.metadata?.app === "prarthana" && item.metadata?.tier === plan.tier) ||
    products.data.find((item) => item.name === `Prarthana ${plan.name}`);

  if (existing) return existing;

  return stripe.products.create({
    name: `Prarthana ${plan.name}`,
    description: plan.summary,
    metadata: {
      app: "prarthana",
      tier: plan.tier
    }
  });
}

async function findOrCreatePrice(product, plan, interval, config) {
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100
  });
  const existing = prices.data.find(
    (item) =>
      item.lookup_key === config.lookupKey ||
      (item.recurring?.interval === interval && item.unit_amount === config.amountCents)
  );

  if (existing) return existing;

  return stripe.prices.create({
    product: product.id,
    currency: config.currency,
    unit_amount: config.amountCents,
    recurring: {
      interval
    },
    lookup_key: config.lookupKey,
    nickname: `${plan.name} ${interval === SUBSCRIPTION_INTERVALS.YEAR ? "Annual" : "Monthly"}`,
    metadata: {
      app: "prarthana",
      tier: plan.tier,
      interval
    }
  });
}

async function main() {
  const envLines = [];

  for (const plan of Object.values(SUBSCRIPTION_PLAN_DEFINITIONS)) {
    if (plan.tier === "free") continue;
    const product = await findOrCreateProduct(plan);
    console.log(`Product ready: ${plan.name} -> ${product.id}`);

    for (const [interval, config] of Object.entries(plan.prices)) {
      const price = await findOrCreatePrice(product, plan, interval, config);
      console.log(`Price ready: ${plan.name} ${interval} -> ${price.id}`);
      envLines.push(`${config.envKey}=${price.id}`);
    }
  }

  console.log("\nSet these Render env vars:");
  envLines.forEach((line) => console.log(line));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
