import { spawn } from "child_process";
import path from "path";
import process from "process";
import dotenv from "dotenv";

const rootDir = process.cwd();
dotenv.config({ path: path.join(rootDir, ".env") });

const port = Number(process.env.PORT || 5000);
const baseUrl = `http://127.0.0.1:${port}/api`;
const readinessUrl = `http://127.0.0.1:${port}/health/ready`;
const localJwtSecret =
  typeof process.env.JWT_SECRET === "string" && process.env.JWT_SECRET.length >= 32
    ? process.env.JWT_SECRET
    : "local-contract-runner-jwt-secret-32chars-min";

function waitForProcessExit(child, timeoutMs = 10_000) {
  return new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({ timedOut: true, code: null });
      }
    }, timeoutMs);

    child.once("exit", (code) => {
      if (resolved) return;
      clearTimeout(timeout);
      resolved = true;
      resolve({ timedOut: false, code });
    });
  });
}

async function waitForReadiness(timeoutMs = 45_000) {
  const start = Date.now();
  let lastError = null;
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(readinessUrl, {
        method: "GET",
        headers: { "content-type": "application/json" }
      });
      if (response.ok) {
        const body = await response.json();
        if (body?.status === "ready") {
          return;
        }
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(
    `Backend did not become ready within ${timeoutMs}ms.${lastError ? ` Last error: ${lastError.message}` : ""}`
  );
}

async function run() {
  const server = spawn(process.execPath, ["src/app.js"], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: String(port),
      JWT_SECRET: localJwtSecret
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stdout.on("data", (chunk) => {
    process.stdout.write(`[backend] ${chunk}`);
  });
  server.stderr.on("data", (chunk) => {
    process.stderr.write(`[backend] ${chunk}`);
  });

  try {
    await waitForReadiness();
    const contract = spawn(process.execPath, ["scripts/contractPrayers.mjs"], {
      cwd: rootDir,
      env: {
        ...process.env,
        CONTRACT_BASE_URL: baseUrl
      },
      stdio: "inherit"
    });

    const contractExit = await new Promise((resolve) => {
      contract.once("exit", (code) => resolve(code ?? 1));
    });

    if (contractExit !== 0) {
      throw new Error(`Prayer contract check failed with exit code ${contractExit}`);
    }
    console.log("Prayer contract local run passed.");
  } finally {
    if (!server.killed) {
      server.kill("SIGTERM");
    }
    const shutdown = await waitForProcessExit(server, 8_000);
    if (shutdown.timedOut && !server.killed) {
      server.kill("SIGKILL");
      await waitForProcessExit(server, 2_000);
    }
  }
}

run().catch((error) => {
  console.error("[contractPrayersLocal] failed:", error.message);
  process.exit(1);
});
