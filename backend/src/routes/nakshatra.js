import { Router } from "express";
import { calculateNakshatra } from "../controllers/panchangController.js";

const router = Router();

router.post("/calculate", calculateNakshatra);

export default router;

