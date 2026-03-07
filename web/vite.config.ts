import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    port: 4173,
    proxy: {
      "/api": {
        target: "https://divya-twug.onrender.com",
        changeOrigin: true,
        secure: true
      },
      "/socket.io": {
        target: "https://divya-twug.onrender.com",
        changeOrigin: true,
        secure: true,
        ws: true
      }
    }
  },
  preview: {
    port: 4173
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/e2e/**"]
  }
});
