import { ApiError } from "../utils/ApiError.js";

const stores = new Map();

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function getStore(key) {
  if (!stores.has(key)) {
    stores.set(key, new Map());
  }
  return stores.get(key);
}

export function createRateLimiter({
  key,
  windowMs = 60_000,
  max = 60,
  includeUser = true
}) {
  const store = getStore(key);

  return function rateLimiter(req, res, next) {
    const clientId = includeUser && req.user?._id ? `${req.user._id}` : getClientIp(req);
    const now = Date.now();
    const bucket = store.get(clientId) || { count: 0, startedAt: now };

    if (now - bucket.startedAt > windowMs) {
      bucket.count = 0;
      bucket.startedAt = now;
    }

    bucket.count += 1;
    store.set(clientId, bucket);

    const remaining = Math.max(0, max - bucket.count);
    const resetInMs = Math.max(0, windowMs - (now - bucket.startedAt));

    res.setHeader("x-ratelimit-limit", String(max));
    res.setHeader("x-ratelimit-remaining", String(remaining));
    res.setHeader("x-ratelimit-reset-ms", String(resetInMs));

    if (bucket.count > max) {
      return next(
        new ApiError("RATE_LIMITED", "Too many requests. Please try again shortly.", {
          retryAfterMs: resetInMs
        })
      );
    }

    if (store.size > 5000) {
      for (const [k, value] of store.entries()) {
        if (now - value.startedAt > windowMs) {
          store.delete(k);
        }
      }
    }

    return next();
  };
}
