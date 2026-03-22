import process from "node:process";
import { defineConfig } from "@playwright/test";

const port = Number(process.env.PORT || 3104);
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${port}`;
const nodeCommand = `"${process.execPath}"`;
const playwrightBackendOrigin =
  process.env.PLAYWRIGHT_BACKEND_ORIGIN ||
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
  "https://www.praarthana.com";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  workers: Number(process.env.PLAYWRIGHT_WORKERS || 1),
  expect: {
    timeout: 15_000
  },
  use: {
    baseURL,
    headless: true,
    trace: "on-first-retry"
  },
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: `${nodeCommand} ./node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port ${port}`,
          url: `${baseURL}/api/csrf`,
          reuseExistingServer: true,
          timeout: 120_000,
          env: {
            ...process.env,
            PORT: String(port),
            NEXT_PUBLIC_SITE_URL: baseURL,
            NEXT_PUBLIC_BACKEND_ORIGIN: playwrightBackendOrigin,
            BACKEND_API_BASE_URL: `${playwrightBackendOrigin.replace(/\/+$/, "")}/api`
          }
        }
      })
});
