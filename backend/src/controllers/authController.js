import bcrypt from "bcrypt";
import crypto from "crypto";
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

function buildBackendBaseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

function getWebAppBaseUrl() {
  return (process.env.WEB_APP_URL || "http://localhost:5173").replace(/\/+$/, "");
}

function sanitizeReturnTo(value) {
  if (!value || typeof value !== "string") return "/home";
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return "/home";
  if (trimmed.startsWith("//")) return "/home";
  return trimmed;
}

function oauthSuccessRedirect(req, token, returnTo = "/home") {
  const url = new URL(`${getWebAppBaseUrl()}/oauth/callback`);
  url.searchParams.set("token", token);
  url.searchParams.set("next", sanitizeReturnTo(returnTo));
  return url.toString();
}

function oauthErrorRedirect(req, message = "oauth_failed") {
  const url = new URL(`${getWebAppBaseUrl()}/login`);
  url.searchParams.set("oauth_error", message);
  return url.toString();
}

function getProviderConfig(provider, req) {
  const backendBase = buildBackendBaseUrl(req);

  if (provider === "google") {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
    const callbackUrl = process.env.GOOGLE_OAUTH_REDIRECT_URI || `${backendBase}/api/auth/oauth/google/callback`;
    return {
      provider,
      enabled: Boolean(clientId && clientSecret),
      clientId,
      clientSecret,
      callbackUrl,
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userUrl: "https://openidconnect.googleapis.com/v1/userinfo",
      scope: "openid email profile"
    };
  }

  if (provider === "github") {
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID || "";
    const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET || "";
    const callbackUrl = process.env.GITHUB_OAUTH_REDIRECT_URI || `${backendBase}/api/auth/oauth/github/callback`;
    return {
      provider,
      enabled: Boolean(clientId && clientSecret),
      clientId,
      clientSecret,
      callbackUrl,
      authUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      userUrl: "https://api.github.com/user",
      emailsUrl: "https://api.github.com/user/emails",
      scope: "read:user user:email"
    };
  }

  return null;
}

function listOAuthProviders(req) {
  return ["google", "github"]
    .map((provider) => getProviderConfig(provider, req))
    .filter(Boolean)
    .map((config) => ({
      id: config.provider,
      enabled: config.enabled
    }));
}

function signOauthState(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10m" });
}

function verifyOauthState(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

async function exchangeGoogleCode(config, code) {
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.callbackUrl,
    grant_type: "authorization_code"
  });

  const tokenResponse = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!tokenResponse.ok) {
    throw new ApiError("AUTH_REQUIRED", "Google token exchange failed");
  }
  const tokenData = await tokenResponse.json();
  if (!tokenData?.access_token) {
    throw new ApiError("AUTH_REQUIRED", "Google access token missing");
  }

  const profileResponse = await fetch(config.userUrl, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  if (!profileResponse.ok) {
    throw new ApiError("AUTH_REQUIRED", "Google profile request failed");
  }

  const profile = await profileResponse.json();
  const email = String(profile.email || "").toLowerCase().trim();
  if (!email) {
    throw new ApiError("AUTH_REQUIRED", "Google account email unavailable");
  }

  return {
    provider: "google",
    providerId: String(profile.sub || ""),
    email,
    name: profile.name || email.split("@")[0],
    picture: profile.picture || null
  };
}

async function exchangeGithubCode(config, code) {
  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.callbackUrl
  });

  const tokenResponse = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });
  if (!tokenResponse.ok) {
    throw new ApiError("AUTH_REQUIRED", "GitHub token exchange failed");
  }
  const tokenData = await tokenResponse.json();
  if (!tokenData?.access_token) {
    throw new ApiError("AUTH_REQUIRED", "GitHub access token missing");
  }

  const profileResponse = await fetch(config.userUrl, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "DivyaApp"
    }
  });
  if (!profileResponse.ok) {
    throw new ApiError("AUTH_REQUIRED", "GitHub profile request failed");
  }
  const profile = await profileResponse.json();

  let email = String(profile.email || "").toLowerCase().trim();
  if (!email) {
    const emailResponse = await fetch(config.emailsUrl, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "DivyaApp"
      }
    });
    if (emailResponse.ok) {
      const emails = await emailResponse.json();
      const primary = Array.isArray(emails)
        ? emails.find((item) => item?.primary && item?.verified) || emails.find((item) => item?.verified) || emails[0]
        : null;
      email = String(primary?.email || "").toLowerCase().trim();
    }
  }

  if (!email) {
    throw new ApiError("AUTH_REQUIRED", "GitHub account email unavailable");
  }

  return {
    provider: "github",
    providerId: String(profile.id || ""),
    email,
    name: profile.name || profile.login || email.split("@")[0],
    picture: profile.avatar_url || null
  };
}

async function upsertOAuthUser(oauthProfile) {
  const providerKey = oauthProfile.provider;
  const providerIdPath = `oauth.${providerKey}.id`;

  let user = await User.findOne({ [providerIdPath]: oauthProfile.providerId });
  if (!user) {
    user = await User.findOne({ email: oauthProfile.email });
  }

  if (!user) {
    const randomPassword = await bcrypt.hash(`oauth-${providerKey}-${crypto.randomUUID()}`, 10);
    user = await User.create({
      name: oauthProfile.name,
      email: oauthProfile.email,
      password: randomPassword,
      profilePicture: oauthProfile.picture || undefined,
      isGuest: false,
      oauth: {
        [providerKey]: { id: oauthProfile.providerId, email: oauthProfile.email }
      }
    });
    return user;
  }

  if (!user.oauth) user.oauth = {};
  if (!user.oauth[providerKey] || user.oauth[providerKey].id !== oauthProfile.providerId) {
    user.oauth[providerKey] = { id: oauthProfile.providerId, email: oauthProfile.email };
  }
  if (!user.profilePicture && oauthProfile.picture) {
    user.profilePicture = oauthProfile.picture;
  }
  if (user.isGuest) {
    user.isGuest = false;
  }
  await user.save();
  return user;
}

export async function oauthProviders(req, res) {
  return res.json({ providers: listOAuthProviders(req) });
}

export async function oauthStart(req, res, next) {
  try {
    const provider = String(req.params.provider || "").toLowerCase();
    const config = getProviderConfig(provider, req);
    if (!config || !config.enabled) {
      throw createValidationError("OAuth provider is not configured");
    }

    const returnTo = sanitizeReturnTo(req.query.returnTo);
    const state = signOauthState({ provider, returnTo });
    const url = new URL(config.authUrl);

    if (provider === "google") {
      url.searchParams.set("client_id", config.clientId);
      url.searchParams.set("redirect_uri", config.callbackUrl);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", config.scope);
      url.searchParams.set("state", state);
      url.searchParams.set("prompt", "select_account");
      url.searchParams.set("access_type", "offline");
    } else if (provider === "github") {
      url.searchParams.set("client_id", config.clientId);
      url.searchParams.set("redirect_uri", config.callbackUrl);
      url.searchParams.set("scope", config.scope);
      url.searchParams.set("state", state);
    }

    return res.redirect(url.toString());
  } catch (error) {
    next(error);
  }
}

export async function oauthCallback(req, res) {
  const fallbackError = (message) => res.redirect(oauthErrorRedirect(req, message));

  try {
    const provider = String(req.params.provider || "").toLowerCase();
    const config = getProviderConfig(provider, req);
    if (!config || !config.enabled) {
      return fallbackError("provider_not_configured");
    }

    const code = String(req.query.code || "").trim();
    const stateToken = String(req.query.state || "").trim();
    if (!code || !stateToken) {
      return fallbackError("missing_code_or_state");
    }

    const state = verifyOauthState(stateToken);
    if (!state || state.provider !== provider) {
      return fallbackError("invalid_state");
    }

    const oauthProfile = provider === "google"
      ? await exchangeGoogleCode(config, code)
      : await exchangeGithubCode(config, code);

    const user = await upsertOAuthUser(oauthProfile);
    const token = signToken(user);
    return res.redirect(oauthSuccessRedirect(req, token, state.returnTo));
  } catch (error) {
    return fallbackError("oauth_callback_failed");
  }
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
