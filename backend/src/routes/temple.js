import { Router } from "express";
import { Temple } from "../models/Temple.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const temple = await Temple.findOne({ isActive: true }).populate("deity");
    return res.json(temple);
  } catch (error) {
    next(error);
  }
});

export default router;

