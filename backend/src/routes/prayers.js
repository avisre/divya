import { Router } from "express";
import { auth, authOptional } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import {
  completePrayer,
  getPrayerAudioMetadata,
  getPrayerAvailability,
  getPrayerCatalogVersion,
  getPrayerEntitlements,
  getDailyRecommendation,
  favoritePrayer,
  getDailyPrayers,
  getFavorites,
  getFeaturedPrayers,
  getPrayerById,
  getPrayers,
  interactWithPrayer,
  openPrayer,
  reportPrayerTextIssue,
  streamPrayerAudio,
  subscribeAudioComingSoon
} from "../controllers/prayerController.js";

const router = Router();
const prayerMutationLimiter = createRateLimiter({ key: "prayer-mutation", windowMs: 60_000, max: 30 });
const prayerIssueLimiter = createRateLimiter({ key: "prayer-issues", windowMs: 60_000, max: 10, includeUser: false });

router.get("/", getPrayers);
router.get("/featured", getFeaturedPrayers);
router.get("/daily", auth, getDailyPrayers);
router.get("/daily-recommendation", authOptional, getDailyRecommendation);
router.get("/catalog/version", getPrayerCatalogVersion);
router.get("/availability", authOptional, getPrayerAvailability);
router.get("/entitlements", authOptional, getPrayerEntitlements);
router.get("/favorites", auth, getFavorites);
router.get("/:id/audio", auth, getPrayerAudioMetadata);
router.get("/:id/audio/stream", authOptional, streamPrayerAudio);
router.get("/:id", getPrayerById);
router.post("/:id/open", auth, prayerMutationLimiter, openPrayer);
router.post("/:id/complete", auth, prayerMutationLimiter, completePrayer);
router.post("/:id/interact", auth, prayerMutationLimiter, interactWithPrayer);
router.post("/:id/favorite", auth, prayerMutationLimiter, favoritePrayer);
router.post("/:id/audio-coming-soon", auth, prayerMutationLimiter, subscribeAudioComingSoon);
router.post("/:id/report-text-issue", authOptional, prayerIssueLimiter, reportPrayerTextIssue);

export default router;
