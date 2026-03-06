import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { ApiError, createValidationError } from "../utils/ApiError.js";

dotenv.config();

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d"
  });
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    country: user.country,
    timezone: user.timezone,
    currency: user.currency,
    onboarding: user.onboarding,
    subscription: user.subscription,
    streak: user.streak,
    learningProgress: user.learningProgress,
    isGuest: user.isGuest
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, country = "US", timezone = "America/New_York" } = req.body;
    if (!name || typeof name !== "string") {
      throw createValidationError("Name is required");
    }
    if (!email || typeof email !== "string") {
      throw createValidationError("Email is required");
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      throw createValidationError("Password must be at least 8 characters");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ApiError("CONFLICT", "Email already in use");
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hash,
      country,
      timezone
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || typeof email !== "string") {
      throw createValidationError("Email is required");
    }
    if (!password || typeof password !== "string") {
      throw createValidationError("Password is required");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new ApiError("AUTH_REQUIRED", "Invalid credentials");
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new ApiError("AUTH_REQUIRED", "Invalid credentials");
    }

    const token = signToken(user);
    return res.json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res) {
  const token = signToken(req.user);
  return res.json({ token, user: serializeUser(req.user) });
}

export async function me(req, res) {
  return res.json({ user: serializeUser(req.user) });
}

export async function guest(req, res, next) {
  try {
    const email = `guest-${Date.now()}@divya.app`;
    const user = await User.create({
      name: "Guest Devotee",
      email,
      password: await bcrypt.hash(Math.random().toString(36), 10),
      isGuest: true,
      sessionsBeforeSignup: Number(req.body?.sessionsBeforeSignup || 1)
    });
    const token = signToken(user);
    return res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
}
