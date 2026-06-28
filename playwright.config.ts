/**
 * @spec docs/SPEC-SDD.md#integracao-e2e
 * @description Configuração Playwright pra smoke tests E2E.
 * @author Mavis
 *
 * Roda contra o dev server (npm run dev) ou build de produção (npm run start).
 * Padrão: 1 worker pra evitar race conditions no localStorage entre testes.
 *
 * Antes de rodar:
 *   npx playwright install chromium   # baixa browser (~150MB)
 *   npm run dev                       # em outro terminal
 *   npm run test:e2e
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ?? "3000";
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // localStorage compartilhado entre tabs em dev
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Mobile-first: viewport padrão é Android pequeno
    viewport: { width: 360, height: 800 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  },
  projects: [
    {
      name: "mobile-android",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.CI
    ? {
        command: "npm run start",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined, // Em dev local, espera o dev server manualmente
});