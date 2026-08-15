import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for the FAITH Foundation site audit.
 *
 * The audit runs against the LIVE production site by default, because its
 * purpose is to certify what the public (and the Google for Nonprofits
 * reviewer) actually sees. Override with AUDIT_BASE_URL to point it at a local
 * `next start` or a Vercel preview deployment.
 */
export default defineConfig({
  testDir: "./scripts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: 4,
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.AUDIT_BASE_URL ?? "https://www.faithfoundationsf.org",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
