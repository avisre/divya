import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import {
  createPrayerSession,
  endPrayerSession,
  getPrayerSession,
  joinPrayerSession
} from "../controllers/prayerSessionController.js";

const router = Router();
const sessionLimiter = createRateLimiter({ key: "prayer-sessions", windowMs: 60_000, max: 90 });

router.use(auth, sessionLimiter);
router.post("/", createPrayerSession);
router.get("/:code", getPrayerSession);
router.post("/:code/join", joinPrayerSession);
router.post("/:code/end", endPrayerSession);

export default router;
