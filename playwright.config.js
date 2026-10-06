const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: /g6-cockpit\.spec\.js/,
  timeout: 30000,
  expect: { timeout: 8000 },
  reporter: [
    ["line"],
    ["html", { outputFolder: "playwright-report", open: "never" }]
  ],
  use: {
    baseURL: "http://127.0.0.1:8080",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "python3 -m http.server 8080 --bind 127.0.0.1",
    url: "http://127.0.0.1:8080",
    reuseExistingServer: false,
    timeout: 10000
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }]
});
