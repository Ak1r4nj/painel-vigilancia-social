import { test, expect } from '@playwright/test';

// Todos os testes partem do dashboard (storageState já tem o token do globalSetup)
test.describe('Fluxo de Revisão (FR-06)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test('abre detalhe e exibe as 3 áreas', async ({ page }) => {
    await page.waitForSelector('[aria-label="Lista de crianças"] li a');
    await page.locator('[aria-label="Lista de crianças"] li a').first().click();
    await expect(page).toHaveURL(/\/children\/child-/, { timeout: 8_000 });

    // Verifica que as 3 seções de área estão presentes
    await expect(page.getByText('Saúde')).toBeVisible();
    await expect(page.getByText('Educação')).toBeVisible();
    await expect(page.getByText('Assistência Social')).toBeVisible();
  });

  test('botão de revisão registra e exibe toast de sucesso', async ({ page }) => {
    await page.waitForSelector('[aria-label="Lista de crianças"] li a');
    await page.locator('[aria-label="Lista de crianças"] li a').first().click();
    await expect(page).toHaveURL(/\/children\/child-/, { timeout: 8_000 });

    // Localiza o botão pelo texto visível (aria-label não é necessário)
    const reviewBtn = page.locator('button').filter({ hasText: /marcar como revisada|revisitar|registrando/i }).first();
    await expect(reviewBtn).toBeVisible({ timeout: 8_000 });
    await reviewBtn.click();

    // Toast de sucesso aparece (exact evita match com live region do radix)
    await expect(page.getByText('Revisão registrada', { exact: true })).toBeVisible({ timeout: 6_000 });
  });

  test('criança sem dados em área exibe aviso "Sem dados"', async ({ page }) => {
    // child-001 (i=0): hasHealth=true, hasEducation=true, hasSocial=true (todos os dados)
    // child-021 (i=20): hasHealth=true, hasEducation=false, hasSocial=true → sem Educação
    await page.goto('/children/child-021');
    await expect(page).toHaveURL(/\/children\/child-021/, { timeout: 8_000 });
    // Aguarda a página carregar
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 8_000 });
    // Deve exibir aviso "Sem dados" para Educação
    await expect(page.getByText('Sem dados')).toBeVisible({ timeout: 8_000 });
  });

  test('botão Voltar retorna ao dashboard', async ({ page }) => {
    await page.waitForSelector('[aria-label="Lista de crianças"] li a');
    await page.locator('[aria-label="Lista de crianças"] li a').first().click();
    await expect(page).toHaveURL(/\/children\/child-/, { timeout: 8_000 });

    await page.getByRole('button', { name: /voltar/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 });
  });
});
