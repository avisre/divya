import { Router } from "express";
import {
  getHealth,
  getSloTargets,
  ingestAudioTelemetryBatch,
  ingestCrash,
  ingestEvent
} from "../controllers/observabilityController.js";
import { authOptional } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = Router();
const ingestLimiter = createRateLimiter({ key: "observability-ingest", windowMs: 60_000, max: 240 });

router.get("/health", getHealth);
router.get("/slo", getSloTargets);
router.post("/events", ingestLimiter, authOptional, ingestEvent);
router.post("/audio-telemetry/batch", ingestLimiter, authOptional, ingestAudioTelemetryBatch);
router.post("/crashes", ingestLimiter, authOptional, ingestCrash);

export default router;
