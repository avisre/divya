function parseBoolean(value, defaultValue = false) {
  if (value == null) return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return defaultValue;
}

export function getServerConfig() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";
  const corsOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    nodeEnv,
    isProduction,
    port: Number(process.env.PORT || 5000),
    mongoUri: process.env.MONGODB_URI || "",
    jwtSecret: process.env.JWT_SECRET || "",
    corsOrigins,
    enforceOriginAllowList: isProduction || corsOrigins.length > 0,
    trustProxy: parseBoolean(process.env.TRUST_PROXY, false),
    disablePayments: parseBoolean(process.env.DISABLE_PAYMENTS, true),
    enableSimulatorApi: parseBoolean(process.env.ENABLE_SIMULATOR_API, false),
    enableObservabilityIngest: parseBoolean(process.env.ENABLE_OBSERVABILITY_INGEST, true)
  };
}

export function validateServerConfig(config) {
  const errors = [];

  if (!config.mongoUri) {
    errors.push("MONGODB_URI is required.");
  }
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    errors.push("JWT_SECRET must be set and at least 32 characters long.");
  }
  if (config.isProduction && config.corsOrigins.length === 0) {
    errors.push("CORS_ORIGINS must be configured in production.");
  }
  if (Number.isNaN(config.port) || config.port <= 0) {
    errors.push("PORT must be a valid positive number.");
  }
  if (!config.disablePayments && !process.env.STRIPE_SECRET_KEY) {
    errors.push("STRIPE_SECRET_KEY is required when DISABLE_PAYMENTS=false.");
  }

  if (errors.length > 0) {
    const summary = errors.map((item) => `- ${item}`).join("\n");
    throw new Error(`Invalid server configuration:\n${summary}`);
  }
}
