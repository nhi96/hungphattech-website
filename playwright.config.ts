import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    channel: "msedge",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop-edge",
      use: { ...devices["Desktop Edge"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile-edge",
      use: { ...devices["Desktop Edge"], viewport: { width: 390, height: 844 } },
    },
  ],
});
