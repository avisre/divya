import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import {
  getCertificate,
  getLearningProgress,
  getProfile,
  getUserPrayerSessions,
  getStats,
  getStreak,
  prayerComplete,
  registerDevice,
  submitContactRequest,
  saveOnboarding,
  useStreakGrace,
  updateProfile,
  updateTimezone
} from "../controllers/userController.js";

const router = Router();
const profileWriteLimiter = createRateLimiter({ key: "user-profile-write", windowMs: 60_000, max: 20 });
const contactLimiter = createRateLimiter({ key: "user-contact", windowMs: 60_000, max: 5 });
const prayerActionLimiter = createRateLimiter({ key: "user-prayer-action", windowMs: 60_000, max: 30 });

router.use(auth);
router.get("/profile", getProfile);
router.put("/profile", profileWriteLimiter, updateProfile);
router.put("/timezone", profileWriteLimiter, updateTimezone);
router.put("/onboarding", profileWriteLimiter, saveOnboarding);
router.post("/prayer-complete", prayerActionLimiter, prayerComplete);
router.post("/streak/use-grace", useStreakGrace);
router.post("/devices", registerDevice);
router.post("/contact", contactLimiter, submitContactRequest);
router.get("/streak", getStreak);
router.get("/stats", getStats);
router.get("/learning-progress", getLearningProgress);
router.get("/prayer-sessions", getUserPrayerSessions);
router.get("/certificate/:milestoneId", getCertificate);

export default router;
