import Stripe from "stripe";
import { User } from "../models/User.js";
import { ApiError } from "./ApiError.js";
import {
  getSubscriptionPlan,
  getSubscriptionPlanCatalog,
  getSubscriptionPriceId,
  resolveSubscriptionPlanFromPriceId
} from "../config/subscriptionPlans.js";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const paymentsDisabled = String(process.env.DISABLE_PAYMENTS || "true").toLowerCase() === "true";
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due", "unpaid"]);
const TERMINAL_SUBSCRIPTION_STATUSES = new Set(["canceled", "incomplete_expired"]);

export function isBillingEnabled() {
  return Boolean(stripe) && !paymentsDisabled;
}

export function hasConfiguredSubscriptionPrices() {
  return Boolean(
    getSubscriptionPriceId("bhakt", "month") &&
      getSubscriptionPriceId("bhakt", "year") &&
      getSubscriptionPriceId("seva", "month") &&
      getSubscriptionPriceId("seva", "year")
  );
}

export function getBillingCatalog() {
  return {
    enabled: isBillingEnabled(),
    subscriptionsConfigured: hasConfiguredSubscriptionPrices(),
    plans: getSubscriptionPlanCatalog()
  };
}

export function assertBillingAvailable() {
  if (!isBillingEnabled()) {
    throw new ApiError("INTERNAL", "Stripe billing is not enabled for this environment.");
  }
}

export function assertSubscriptionPriceAvailable(tier, interval) {
  const plan = getSubscriptionPlan(tier);
  if (!plan || tier === "free") {
    throw new ApiError("VALIDATION_FAILED", "The selected subscription tier is invalid.");
  }

  const priceId = getSubscriptionPriceId(tier, interval);
  if (!priceId) {
    throw new ApiError("INTERNAL", "Stripe price IDs are missing for this subscription plan.");
  }

  return priceId;
}

function baseWebUrl() {
  return (process.env.WEB_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function toDateFromUnix(value) {
  return typeof value === "number" ? new Date(value * 1000) : null;
}

function normalizeReturnPath(value, fallback) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  return raw;
}

function activePaidSubscription(user) {
  const status = String(user?.subscription?.status || "").toLowerCase();
  return Boolean(
    user?.subscription?.stripeSubscriptionId &&
      user?.subscription?.tier &&
      user.subscription.tier !== "free" &&
      ACTIVE_SUBSCRIPTION_STATUSES.has(status)
  );
}

async function findCustomerByEmail(user) {
  if (!stripe || !user?.email) return null;
  const result = await stripe.customers.list({ email: user.email, limit: 10 });
  return (
    result.data.find((candidate) => String(candidate.metadata?.appUserId || "") === String(user._id)) ||
    result.data.find((candidate) => String(candidate.email || "").toLowerCase() === String(user.email || "").toLowerCase()) ||
    null
  );
}

export async function getOrCreateStripeCustomer(user) {
  assertBillingAvailable();

  const storedCustomerId = String(user?.subscription?.stripeCustomerId || "").trim();
  if (storedCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(storedCustomerId);
      if (!existing.deleted) {
        return existing;
      }
    } catch {
      // Fall through and recreate from email.
    }
  }

  const existingByEmail = await findCustomerByEmail(user);
  if (existingByEmail) {
    user.subscription = {
      ...(user.subscription?.toObject ? user.subscription.toObject() : user.subscription || {}),
      stripeCustomerId: existingByEmail.id
    };
    await user.save();
    return existingByEmail;
  }

  const created = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      app: "prarthana",
      appUserId: user._id.toString()
    }
  });

  user.subscription = {
    ...(user.subscription?.toObject ? user.subscription.toObject() : user.subscription || {}),
    stripeCustomerId: created.id
  };
  await user.save();
  return created;
}

async function resolveUserForStripeSubscription(subscription, fallbackUserId = null) {
  const userId = String(subscription?.metadata?.userId || fallbackUserId || "").trim();
  if (userId) {
    const direct = await User.findById(userId);
    if (direct) return direct;
  }

  const customerId = String(subscription?.customer || "").trim();
  if (customerId) {
    const byCustomer = await User.findOne({ "subscription.stripeCustomerId": customerId });
    if (byCustomer) return byCustomer;
  }

  return null;
}

function buildFreeSubscriptionState(previous = {}) {
  return {
    ...previous,
    tier: "free",
    priceId: null,
    stripeSubscriptionId: null,
    interval: null,
    status: "inactive",
    currentPeriodStart: null,
    currentPeriodEnd: null,
    expiresAt: null,
    cancelAtPeriodEnd: false
  };
}

export async function syncUserSubscriptionFromStripeSubscription(subscription, options = {}) {
  const user = await resolveUserForStripeSubscription(subscription, options.userId);
  if (!user) return null;

  const previous = user.subscription?.toObject ? user.subscription.toObject() : user.subscription || {};
  const item = subscription?.items?.data?.[0] || null;
  const priceId = item?.price?.id || null;
  const matchedPlan = resolveSubscriptionPlanFromPriceId(priceId);
  const status = String(subscription?.status || "").toLowerCase();

  if (!matchedPlan || TERMINAL_SUBSCRIPTION_STATUSES.has(status)) {
    user.subscription = buildFreeSubscriptionState(previous);
    user.subscription.stripeCustomerId = String(subscription?.customer || previous.stripeCustomerId || "").trim() || null;
    await user.save();
    return user;
  }

  user.subscription = {
    ...previous,
    tier: matchedPlan.tier,
    priceId,
    stripeCustomerId: String(subscription?.customer || previous.stripeCustomerId || "").trim() || null,
    stripeSubscriptionId: String(subscription?.id || "").trim() || null,
    status,
    interval: matchedPlan.interval,
    platform: "web",
    currentPeriodStart: toDateFromUnix(subscription.current_period_start),
    currentPeriodEnd: toDateFromUnix(subscription.current_period_end),
    expiresAt: toDateFromUnix(subscription.current_period_end),
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end)
  };

  await user.save();
  return user;
}

export async function syncUserSubscriptionFromCheckoutSession(session) {
  assertBillingAvailable();
  const subscriptionId =
    typeof session?.subscription === "string" ? session.subscription : session?.subscription?.id;
  if (!subscriptionId) {
    return null;
  }
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"]
  });
  return syncUserSubscriptionFromStripeSubscription(subscription, {
    userId: session?.client_reference_id || session?.metadata?.userId || null
  });
}

export async function createSubscriptionCheckoutSession({
  user,
  tier,
  interval,
  successPath = "/plans?checkout=success",
  cancelPath = "/plans?checkout=cancelled"
}) {
  assertBillingAvailable();

  if (activePaidSubscription(user)) {
    throw new ApiError("VALIDATION_FAILED", "You already have an active paid plan. Use billing management to change it.");
  }

  const priceId = assertSubscriptionPriceAvailable(tier, interval);
  const customer = await getOrCreateStripeCustomer(user);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    client_reference_id: user._id.toString(),
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${baseWebUrl()}${normalizeReturnPath(successPath, "/plans?checkout=success")}`,
    cancel_url: `${baseWebUrl()}${normalizeReturnPath(cancelPath, "/plans?checkout=cancelled")}`,
    metadata: {
      app: "prarthana",
      userId: user._id.toString(),
      tier,
      interval
    },
    subscription_data: {
      metadata: {
        app: "prarthana",
        userId: user._id.toString(),
        tier,
        interval
      }
    }
  });

  return session;
}

export async function createBillingPortalSession({ user, returnPath = "/plans" }) {
  assertBillingAvailable();

  const customer = await getOrCreateStripeCustomer(user);
  if (!customer?.id) {
    throw new ApiError("NOT_FOUND", "Stripe customer could not be resolved for this account.");
  }

  return stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${baseWebUrl()}${normalizeReturnPath(returnPath, "/plans")}`
  });
}

export function summarizeSubscriptionForResponse(subscription) {
  const plan = getSubscriptionPlan(subscription?.tier || "free");
  return {
    tier: subscription?.tier || "free",
    status: subscription?.status || "inactive",
    interval: subscription?.interval || null,
    cancelAtPeriodEnd: Boolean(subscription?.cancelAtPeriodEnd),
    currentPeriodEnd: subscription?.currentPeriodEnd || null,
    name: plan?.name || "Free"
  };
}
