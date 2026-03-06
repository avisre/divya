import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

dotenv.config();

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError("AUTH_REQUIRED");
    }

    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      throw new ApiError("AUTH_REQUIRED", "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError("AUTH_REQUIRED", "Invalid token"));
  }
}

export async function authOptional(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return next();
    }

    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (user) {
      req.user = user;
    }
    return next();
  } catch (error) {
    return next();
  }
}
