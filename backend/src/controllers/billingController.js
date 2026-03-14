import { createValidationError } from "../utils/ApiError.js";
import {
  createBillingPortalSession,
  createSubscriptionCheckoutSession,
  getBillingCatalog,
  summarizeSubscriptionForResponse
} from "../utils/subscriptionBilling.js";

function normalizeInterval(value) {
  const raw = String(value || "month").trim().toLowerCase();
  return raw === "year" ? "year" : "month";
}

export async function getBillingPlans(req, res, next) {
  try {
    const catalog = getBillingCatalog();
    return res.json({
      ...catalog,
      currentSubscription: req.user ? summarizeSubscriptionForResponse(req.user.subscription) : null
    });
  } catch (error) {
    next(error);
  }
}

export async function createCheckoutSession(req, res, next) {
  try {
    const tier = String(req.body?.tier || "").trim().toLowerCase();
    if (!["bhakt", "seva"].includes(tier)) {
      throw createValidationError("tier must be bhakt or seva");
    }

    const session = await createSubscriptionCheckoutSession({
      user: req.user,
      tier,
      interval: normalizeInterval(req.body?.interval),
      successPath: typeof req.body?.successPath === "string" ? req.body.successPath : undefined,
      cancelPath: typeof req.body?.cancelPath === "string" ? req.body.cancelPath : undefined
    });

    return res.status(201).json({
      id: session.id,
      url: session.url
    });
  } catch (error) {
    next(error);
  }
}

export async function createPortalSession(req, res, next) {
  try {
    const session = await createBillingPortalSession({
      user: req.user,
      returnPath: typeof req.body?.returnPath === "string" ? req.body.returnPath : undefined
    });

    return res.status(201).json({
      id: session.id,
      url: session.url
    });
  } catch (error) {
    next(error);
  }
}
