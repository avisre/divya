import { Router } from "express";
import { getPanchangByDate, getTodayPanchang, getUpcomingPanchang } from "../controllers/panchangController.js";

const router = Router();

router.get("/today", getTodayPanchang);
router.get("/upcoming", getUpcomingPanchang);
router.get("/:date", getPanchangByDate);

export default router;

