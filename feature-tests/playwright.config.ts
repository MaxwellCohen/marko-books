import { defineConfig } from "@playwright/test";

const PORT = process.env.FT_PORT ?? "4127";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  timeout: 240_000,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 720 },
    launchOptions: { executablePath: process.env.CHROME_PATH ?? "/home/maxc/.local/bin/google-chrome" },
  },
});
