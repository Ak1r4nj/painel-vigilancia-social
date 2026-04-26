import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:3000',
    // Reutiliza token salvo pelo globalSetup — evita re-login em cada teste
    storageState: 'e2e/.auth.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Sobe API e Web automaticamente antes dos testes
  webServer: [
    {
      command: 'npm run dev --workspace=apps/api',
      url: 'http://localhost:3001/health',
      reuseExistingServer: true,
      timeout: 30_000,
      env: {
        DATABASE_URL: 'file:./prisma/dev.db',
        JWT_SECRET: 'e2e-test-secret',
        PORT: '3001',
        CORS_ORIGIN: 'http://localhost:3000',
        NODE_ENV: 'development',
      },
    },
    {
      command: 'npm run dev --workspace=apps/web',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
