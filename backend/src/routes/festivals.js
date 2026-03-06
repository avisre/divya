import { Router } from "express";
import { getFestivalById, getFestivals, getUpcomingFestivals } from "../controllers/festivalController.js";

const router = Router();

router.get("/", getFestivals);
router.get("/upcoming", getUpcomingFestivals);
router.get("/:id", getFestivalById);

export default router;
