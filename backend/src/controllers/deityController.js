import { Deity } from "../models/Deity.js";
import { DeityLearningPath } from "../models/DeityLearningPath.js";

function normalizeId(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString();
}

export async function getDeities(req, res, next) {
  try {
    const deities = await Deity.find().sort({ order: 1, "name.en": 1 });
    return res.json(deities);
  } catch (error) {
    next(error);
  }
}

export async function getDeityById(req, res, next) {
  try {
    const deity = await Deity.findById(req.params.id);
    if (!deity) {
      return res.status(404).json({ message: "Deity not found" });
    }
    return res.json(deity);
  } catch (error) {
    next(error);
  }
}

export async function getDeityLearningPath(req, res, next) {
  try {
    const deity = await Deity.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
    if (!deity) {
      return res.status(404).json({ message: "Deity not found" });
    }

    const path = await DeityLearningPath.findOne({ deity: deity._id }).populate("deity modules.linkedPrayer");
    if (!path) {
      return res.status(404).json({ message: "Learning path not found" });
    }

    const progress = req.user?.learningProgress?.find(
      (entry) => normalizeId(entry.deityId) === normalizeId(deity._id)
    );
    const completedModules = new Set((progress?.completedModules || []).map((value) => Number(value)));

    const userTier = req.user?.subscription?.tier || "free";
    const modules = path.modules.map((module) => ({
      ...module.toObject(),
      isCompleted: completedModules.has(module.order),
      isLockedByTier: Boolean(module.isLocked && userTier === "free")
    }));

    return res.json({
      ...path.toObject(),
      modules,
      progress: {
        completedCount: completedModules.size,
        totalModules: path.totalModules || path.modules.length
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getLearningModuleById(req, res, next) {
  try {
    const deity = await Deity.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
    if (!deity) {
      return res.status(404).json({ message: "Deity not found" });
    }

    const path = await DeityLearningPath.findOne({ deity: deity._id }).populate("deity modules.linkedPrayer");
    if (!path) {
      return res.status(404).json({ message: "Learning path not found" });
    }

    const module = path.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: "Learning module not found" });
    }

    const tier = req.user?.subscription?.tier || "free";
    if (module.isLocked && tier === "free") {
      return res.status(402).json({ message: "This module is available on Bhakt and Seva plans." });
    }

    return res.json({
      deity: path.deity,
      module
    });
  } catch (error) {
    next(error);
  }
}

export async function completeLearningModule(req, res, next) {
  try {
    const deity = await Deity.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
    if (!deity) {
      return res.status(404).json({ message: "Deity not found" });
    }

    const path = await DeityLearningPath.findOne({ deity: deity._id });
    if (!path) {
      return res.status(404).json({ message: "Learning path not found" });
    }

    const module = path.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: "Learning module not found" });
    }

    const tier = req.user?.subscription?.tier || "free";
    if (module.isLocked && tier === "free") {
      return res.status(402).json({ message: "This module is available on Bhakt and Seva plans." });
    }

    const existingIndex = req.user.learningProgress.findIndex(
      (entry) => normalizeId(entry.deityId) === normalizeId(deity._id)
    );
    if (existingIndex === -1) {
      req.user.learningProgress.push({
        deityId: deity._id,
        completedModules: [module.order],
        lastAccessedAt: new Date()
      });
    } else {
      const existing = req.user.learningProgress[existingIndex];
      if (!existing.completedModules.includes(module.order)) {
        existing.completedModules.push(module.order);
      }
      existing.lastAccessedAt = new Date();
    }

    await req.user.save();
    return res.json({
      success: true,
      deityId: deity._id,
      moduleId: module._id,
      moduleOrder: module.order
    });
  } catch (error) {
    next(error);
  }
}
