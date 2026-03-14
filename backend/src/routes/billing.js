import { Router } from "express";
import { auth, authOptional } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import {
  createCheckoutSession,
  createPortalSession,
  getBillingPlans
} from "../controllers/billingController.js";

const router = Router();
const billingLimiter = createRateLimiter({ key: "billing", windowMs: 60_000, max: 12 });

router.get("/plans", authOptional, getBillingPlans);
router.use(auth);
router.post("/checkout-session", billingLimiter, createCheckoutSession);
router.post("/portal-session", billingLimiter, createPortalSession);

export default router;
