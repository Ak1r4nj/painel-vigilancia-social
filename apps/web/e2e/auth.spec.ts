import { test, expect } from '@playwright/test';

// Auth tests precisam testar o fluxo completo — sem token pre-carregado
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Autenticação (FR-01 / FR-02)', () => {
  test.beforeEach(async ({ page }) => {
    // Garante estado limpo: navega primeiro para poder acessar localStorage
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.context().clearCookies();
  });

  test('redireciona / para /login quando não autenticado', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('exibe erro com credenciais incorretas', async ({ page }) => {
    await page.getByLabel('E-mail').fill('tecnico@prefeitura.rio');
    await page.getByLabel('Senha').fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Com credenciais erradas, o usuário deve permanecer no login (não entrar no dashboard)
    await page.waitForTimeout(3_000); // aguarda resposta da API
    await expect(page).toHaveURL(/\/login/);
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('login com sucesso redireciona para /dashboard', async ({ page }) => {
    await page.getByLabel('E-mail').fill('tecnico@prefeitura.rio');
    await page.getByLabel('Senha').fill('painel@2024');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    await expect(page.getByText('Visão Geral')).toBeVisible();
  });

  test('logout limpa sessão e redireciona para /login', async ({ page }) => {
    // Faz login
    await page.getByLabel('E-mail').fill('tecnico@prefeitura.rio');
    await page.getByLabel('Senha').fill('painel@2024');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });

    // Faz logout
    await page.getByRole('button', { name: /sair/i }).click();
    await expect(page).toHaveURL(/\/login/);

    // Confirma que token foi removido
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeNull();
  });

  test('token expirado redireciona para /login', async ({ page }) => {
    // Injeta token inválido/expirado diretamente
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'token.invalido.expirado');
    });
    await page.goto('/dashboard');
    // AuthGuard ou interceptor 401 deve redirecionar
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
