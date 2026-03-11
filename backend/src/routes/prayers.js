import { Router } from "express";
import { auth, authOptional } from "../middleware/auth.js";
import {
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
  reportPrayerTextIssue,
  streamPrayerAudio,
  subscribeAudioComingSoon
} from "../controllers/prayerController.js";

const router = Router();

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
router.post("/:id/favorite", auth, favoritePrayer);
router.post("/:id/audio-coming-soon", auth, subscribeAudioComingSoon);
router.post("/:id/report-text-issue", authOptional, reportPrayerTextIssue);

export default router;
