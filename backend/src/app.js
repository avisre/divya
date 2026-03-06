import cors from "cors";
import cron from "node-cron";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import compression from "compression";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import prayerRoutes from "./routes/prayers.js";
import deityRoutes from "./routes/deities.js";
import festivalRoutes from "./routes/festivals.js";
import panchangRoutes from "./routes/panchang.js";
import nakshatraRoutes from "./routes/nakshatra.js";
import templeRoutes from "./routes/temple.js";
import pujaRoutes from "./routes/pujas.js";
import bookingRoutes from "./routes/bookings.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import observabilityRoutes from "./routes/observability.js";
import webhookRoutes from "./routes/webhooks.js";
import simulatorRoutes from "./routes/simulator.js";
import prayerSessionRoutes from "./routes/prayerSessions.js";
import { initPrayerSessionSocket } from "./sockets/prayerSession.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestContext } from "./middleware/requestContext.js";
import { createRateLimiter } from "./middleware/rateLimit.js";
import { runDailyPanchangJob } from "./jobs/panchangJob.js";
import { runWaitlistJob } from "./jobs/waitlistJob.js";
import { getServerConfig, validateServerConfig } from "./config/env.js";

dotenv.config();
const config = getServerConfig();
validateServerConfig(config);

const app = express();
const httpServer = createServer(app);
if (config.trustProxy) {
  app.set("trust proxy", 1);
}
app.disable("x-powered-by");

const corsOptions = config.enforceOriginAllowList
  ? {
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin not allowed by CORS"));
      },
      credentials: true
    }
  : { origin: true, credentials: true };

const globalApiLimiter = createRateLimiter({
  key: "api-global",
  windowMs: 60_000,
  max: 360,
  includeUser: false
});

app.use(requestContext);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(compression());
app.use(cors(corsOptions));
app.use(morgan(config.isProduction ? "combined" : "dev"));
app.use("/api/webhooks", webhookRoutes);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false, limit: "2mb" }));
app.use("/api", globalApiLimiter);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    requestId: req.requestId || null,
    uptimeSeconds: process.uptime()
  });
});

app.get("/health/live", (req, res) => {
  res.status(200).json({ status: "alive", requestId: req.requestId || null });
});

app.get("/health/ready", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    mongodb: ready ? "up" : "down",
    requestId: req.requestId || null
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/prayers", prayerRoutes);
app.use("/api/deities", deityRoutes);
app.use("/api/festivals", festivalRoutes);
app.use("/api/panchang", panchangRoutes);
app.use("/api/nakshatra", nakshatraRoutes);
app.use("/api/temple", templeRoutes);
app.use("/api/pujas", pujaRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
if (config.enableObservabilityIngest) {
  app.use("/api/observability", observabilityRoutes);
}
if (config.enableSimulatorApi) {
  app.use("/api/simulator", simulatorRoutes);
}
app.use("/api/prayer-sessions", prayerSessionRoutes);
app.use(errorHandler);

const socketCors = config.enforceOriginAllowList
  ? {
      origin(origin, callback) {
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin not allowed by socket CORS"));
      },
      methods: ["GET", "POST"]
    }
  : {
      origin: "*",
      methods: ["GET", "POST"]
    };

const io = new Server(httpServer, { cors: socketCors, transports: ["websocket"] });
initPrayerSessionSocket(io);

let shuttingDown = false;

async function start() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10_000
  });
  const dailyPanchangTask = cron.schedule("0 0 * * *", runDailyPanchangJob);
  const waitlistTask = cron.schedule("0 8 * * *", runWaitlistJob);

  httpServer.listen(config.port, () => {
    console.log(`Divya backend listening on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Payments disabled: ${config.disablePayments}`);
    console.log(`Simulator API enabled: ${config.enableSimulatorApi}`);
  });

  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down gracefully...`);
    dailyPanchangTask.stop();
    waitlistTask.stop();
    io.close();
    httpServer.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGINT", () => {
    shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    shutdown("SIGTERM");
  });
}

start().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
