import crypto from "crypto";

export function requestContext(req, res, next) {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = requestId;
  req.requestStartedAt = Date.now();
  res.setHeader("x-request-id", requestId);
  next();
}
