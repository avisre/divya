import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  guest,
  login,
  me,
  oauthCallback,
  oauthProviders,
  oauthStart,
  refreshToken,
  register
} from "../controllers/authController.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = Router();
const authLimiter = createRateLimiter({ key: "auth", windowMs: 60_000, max: 25, includeUser: false });

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/guest", authLimiter, guest);
router.get("/oauth/providers", oauthProviders);
router.get("/oauth/:provider/start", authLimiter, oauthStart);
router.get("/oauth/:provider/callback", oauthCallback);
router.post("/refresh-token", auth, refreshToken);
router.get("/me", auth, me);

export default router;
