import dotenv from "dotenv";
import { getServerConfig, validateServerConfig } from "./config/env.js";
import {
  createBackendHttpServer,
  initializeBackendRuntime,
  stopBackendRuntime
} from "./serverCore.js";

dotenv.config();
const config = getServerConfig();
validateServerConfig(config);

let shuttingDown = false;

async function start() {
  const { httpServer, io } = createBackendHttpServer(config);
  const { dailyPanchangTask, waitlistTask } = await initializeBackendRuntime(config);

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
    stopBackendRuntime({ io, httpServer, dailyPanchangTask, waitlistTask })
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
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
