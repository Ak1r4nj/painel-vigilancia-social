import { chromium, type FullConfig } from '@playwright/test';

/**
 * Faz login uma única vez antes de toda a suíte e salva o token em storageState.
 * Isso evita N chamadas à rota /auth/token (rate-limited em 5/min) durante os testes.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:3000';

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  await page.goto('/login');
  await page.getByLabel('E-mail').fill('tecnico@prefeitura.rio');
  await page.getByLabel('Senha').fill('painel@2024');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });

  // Persiste localStorage (access_token) para reutilização nos testes
  await context.storageState({ path: 'e2e/.auth.json' });

  await browser.close();
}

export default globalSetup;
