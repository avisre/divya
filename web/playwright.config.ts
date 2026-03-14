import { defineConfig } from "@playwright/test";

const port = Number(process.env.PORT || 3104);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 15_000
  },
  use: {
    baseURL,
    headless: true,
    trace: "on-first-retry"
  },
  webServer: {
    command: "node scripts/run_local_test_server.mjs",
    url: `${baseURL}/health/ready`,
    reuseExistingServer: true,
    timeout: 120_000
  }
});
