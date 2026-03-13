import process from "node:process";
import next from "next";
import { getServerConfig, validateServerConfig } from "../backend/src/config/env.js";
import {
  createBackendHttpServer,
  initializeBackendRuntime,
  stopBackendRuntime
} from "../backend/src/serverCore.js";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 10000);

if (!process.env.BACKEND_API_BASE_URL && process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.BACKEND_API_BASE_URL = `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")}/api`;
}
if (!process.env.NEXT_PUBLIC_BACKEND_ORIGIN && process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
}
if (!process.env.WEB_APP_URL && process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.WEB_APP_URL = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
}

const config = getServerConfig();
validateServerConfig(config);

const nextApp = next({
  dev,
  dir: process.cwd()
});

async function startUnifiedServer() {
  const { app, httpServer, io } = createBackendHttpServer(config);
  let runtime = null;
  let nextReady = false;
  let nextPrepareError = null;
  let nextHandler = null;
  let nextPreparePromise = null;

  app.all("*", async (req, res) => {
    if (!nextPreparePromise) {
      res.status(503).send("Web runtime is starting.");
      return;
    }

    if (!nextReady) {
      try {
        await nextPreparePromise;
      } catch {
        res.status(503).send("Web runtime failed to initialize.");
        return;
      }
    }

    if (nextPrepareError || !nextHandler) {
      res.status(503).send("Web runtime failed to initialize.");
      return;
    }

    return nextHandler(req, res);
  });

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down unified server...`);
    try {
      await stopBackendRuntime({
        io,
        httpServer,
        ...runtime
      });
      process.exit(0);
    } catch (error) {
      console.error("Unified shutdown failed", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  await new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, () => {
      httpServer.off("error", reject);
      console.log(`Divya unified app listening on port ${port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Serving web and API from one process`);
      resolve();
    });
  });

  nextPreparePromise = nextApp
    .prepare()
    .then(() => {
      nextHandler = nextApp.getRequestHandler();
      nextReady = true;
      console.log("Next web runtime initialized");
    })
    .catch((error) => {
      nextPrepareError = error;
      console.error("Failed to initialize Next web runtime", error);
      throw error;
    });

  try {
    runtime = await initializeBackendRuntime(config);
    console.log("Backend runtime initialized");
  } catch (error) {
    console.error("Failed to initialize backend runtime", error);
    await stopBackendRuntime({
      io,
      httpServer,
      ...runtime
    });
    process.exit(1);
  }

  try {
    await nextPreparePromise;
  } catch {
    await stopBackendRuntime({
      io,
      httpServer,
      ...runtime
    });
    process.exit(1);
  }
}

startUnifiedServer().catch((error) => {
  console.error("Failed to start unified app", error);
  process.exit(1);
});
