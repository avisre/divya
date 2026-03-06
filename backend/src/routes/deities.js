import { Router } from "express";
import { auth, authOptional } from "../middleware/auth.js";
import {
  completeLearningModule,
  getDeities,
  getDeityById,
  getDeityLearningPath,
  getLearningModuleById
} from "../controllers/deityController.js";

const router = Router();

router.get("/", getDeities);
router.get("/:id/learning-path", authOptional, getDeityLearningPath);
router.get("/:id/learning-path/:moduleId", authOptional, getLearningModuleById);
router.post("/:id/learning-path/:moduleId/complete", auth, completeLearningModule);
router.get("/:id", getDeityById);

export default router;
