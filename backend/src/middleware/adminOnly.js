import { ApiError } from "../utils/ApiError.js";

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new ApiError("FORBIDDEN", "Admin access required"));
  }
  return next();
}
