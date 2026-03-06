import { Router } from "express";
import { getPujaById, getPujas } from "../controllers/pujaController.js";

const router = Router();

router.get("/", getPujas);
router.get("/:id", getPujaById);

export default router;

