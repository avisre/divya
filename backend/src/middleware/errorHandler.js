import { ErrorCatalog } from "../utils/errorCatalog.js";

export function errorHandler(error, req, res, next) {
  const fallback = ErrorCatalog.INTERNAL;
  const status = error.status || fallback.status;
  const code = error.code || fallback.code;
  const message = error.message || fallback.message;
  const durationMs = typeof req?.requestStartedAt === "number" ? Date.now() - req.requestStartedAt : null;

  return res.status(status).json({
    code,
    message,
    requestId: req?.requestId || null,
    durationMs,
    ...(error.details ? { details: error.details } : {}),
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {})
  });
}
