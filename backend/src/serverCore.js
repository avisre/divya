import cors from "cors";
import cron from "node-cron";
import express from "express";
import compression from "compression";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import { createServer } from "http";
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

function createCorsOptions(config) {
  if (!config.enforceOriginAllowList) {
    return { origin: true, credentials: true };
  }

  return {
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  };
}

function createSocketCors(config) {
  if (!config.enforceOriginAllowList) {
    return {
      origin: "*",
      methods: ["GET", "POST"]
    };
  }

  return {
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by socket CORS"));
    },
    methods: ["GET", "POST"]
  };
}

export function createBackendApp(config) {
  const app = express();
  if (config.trustProxy) {
    app.set("trust proxy", 1);
  }
  app.disable("x-powered-by");

  const globalApiLimiter = createRateLimiter({
    key: "api-global",
    windowMs: 60_000,
    max: 360,
    includeUser: false
  });

  app.use(requestContext);
  app.use(
    helmet({
      // The unified server also serves Next.js HTML. Default Helmet CSP would
      // block Next's inline runtime bootstrap, so keep the safety headers but
      // disable CSP here.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(compression());
  app.use(cors(createCorsOptions(config)));
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

  return app;
}

export function createBackendHttpServer(config) {
  const app = createBackendApp(config);
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: createSocketCors(config),
    transports: ["websocket"]
  });
  initPrayerSessionSocket(io);
  return { app, httpServer, io };
}

export async function initializeBackendRuntime(config) {
  mongoose.set("strictQuery", true);
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10_000
    });
  }

  const dailyPanchangTask = cron.schedule("0 0 * * *", runDailyPanchangJob);
  const waitlistTask = cron.schedule("0 8 * * *", runWaitlistJob);
  return { dailyPanchangTask, waitlistTask };
}

export async function stopBackendRuntime({ io, httpServer, dailyPanchangTask, waitlistTask }) {
  dailyPanchangTask?.stop();
  waitlistTask?.stop();
  io?.close();

  await new Promise((resolve) => {
    if (!httpServer?.listening) {
      resolve();
      return;
    }
    httpServer.close(() => resolve());
  });

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}
