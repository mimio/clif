import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT) || 3999;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          // The globe is WebGL, and CI runners have no GPU. ANGLE over
          // SwiftShader gives a real (software) GL context instead of the
          // null one Chromium falls back to.
          args: [
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
            '--ignore-gpu-blocklist',
          ],
        },
      },
    },
  ],
  webServer: {
    // The e2e suite runs against a production build, the same as the site.
    // CI has already run `pnpm build` as its own step, so it sets
    // PLAYWRIGHT_REUSE_BUILD and this only boots the server.
    command: process.env.PLAYWRIGHT_REUSE_BUILD
      ? 'pnpm start'
      : 'pnpm build && pnpm start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      PORT: String(PORT),
      NEXT_TELEMETRY_DISABLED: '1',
      // Every Mapbox request is answered locally by the fixture below, so the
      // build only needs a token-shaped value, never a real one.
      NEXT_PUBLIC_MAPBOX_TOKEN:
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? 'pk.e2e-placeholder',
    },
  },
});
