import { Router } from "express";
import { getSimulatorBootstrap, simulateBooking } from "../controllers/simulatorController.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = Router();
const simulatorLimiter = createRateLimiter({ key: "simulator", windowMs: 60_000, max: 90, includeUser: false });

router.get("/bootstrap", simulatorLimiter, getSimulatorBootstrap);
router.post("/booking", simulatorLimiter, simulateBooking);

export default router;
