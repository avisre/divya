import { Router } from "express";
import { auth } from "../middleware/auth.js";
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

router.use(auth);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/timezone", updateTimezone);
router.put("/onboarding", saveOnboarding);
router.post("/prayer-complete", prayerComplete);
router.post("/streak/use-grace", useStreakGrace);
router.post("/devices", registerDevice);
router.post("/contact", submitContactRequest);
router.get("/streak", getStreak);
router.get("/stats", getStats);
router.get("/learning-progress", getLearningProgress);
router.get("/prayer-sessions", getUserPrayerSessions);
router.get("/certificate/:milestoneId", getCertificate);

export default router;
