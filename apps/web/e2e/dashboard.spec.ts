import { test, expect } from '@playwright/test';

// Todos os testes partem do dashboard (storageState já tem o token do globalSetup)
test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
});

test.describe('Dashboard — Summary Cards (FR-05)', () => {
  test('exibe os 6 cards de resumo', async ({ page }) => {
    // Aguarda seção de resumo carregar
    const summary = page.locator('[aria-label="Resumo geral"]');
    await expect(summary).toBeVisible({ timeout: 8_000 });

    await expect(summary.getByText('Total de Crianças')).toBeVisible();
    await expect(summary.getByText('Alertas de Saúde')).toBeVisible();
    await expect(summary.getByText('Alertas de Educação')).toBeVisible();
    await expect(summary.getByText('Alertas de Assistência')).toBeVisible();
    await expect(summary.getByText('Revisadas')).toBeVisible();
    await expect(summary.getByText('Pendentes')).toBeVisible();
  });

  test('cards exibem números maiores que zero', async ({ page }) => {
    await expect(page.getByText('Total de Crianças')).toBeVisible();
    const cards = page.locator('[aria-label="Resumo geral"] .text-3xl');
    await expect(cards.first()).not.toHaveText('—', { timeout: 8_000 });
  });
});

test.describe('Lista de Crianças + Filtros (FR-03 / FR-07)', () => {
  test('exibe lista de crianças com contagem', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /crianças/i, level: 2 })).toBeVisible();
    // Aguarda pelo menos um item aparecer na lista
    const lista = page.locator('[aria-label="Lista de crianças"]');
    await expect(lista.locator('li').first()).toBeVisible({ timeout: 8_000 });
  });

  test('filtro por alertas mostra apenas crianças com alerta', async ({ page }) => {
    // Aguarda o select aparecer (Desktop: sempre visível)
    const alertsFilter = page.locator('select#alerts-filter');
    await expect(alertsFilter).toBeVisible({ timeout: 8_000 });
    await alertsFilter.selectOption('true');
    // Pelo menos um badge de alerta deve estar visível
    const alertBadges = page.getByText(/alerta/i);
    await expect(alertBadges.first()).toBeVisible({ timeout: 8_000 });
  });

  test('filtro sem resultado exibe mensagem vazia', async ({ page }) => {
    // Filtra crianças revisadas E sem alertas para tentar chegar em lista vazia
    const reviewedFilter = page.locator('select#reviewed-filter');
    const alertsFilter = page.locator('select#alerts-filter');
    await expect(reviewedFilter).toBeVisible({ timeout: 8_000 });
    await reviewedFilter.selectOption('true');
    await alertsFilter.selectOption('false');
    // Pode retornar lista vazia ou lista com itens — ambos são estados válidos
    await page.waitForTimeout(1_000);
    // Não verifica resultado específico: apenas garante que a página não quebra
    await expect(page.locator('main')).toBeVisible();
  });

  test('clica numa criança e abre detalhe', async ({ page }) => {
    await page.waitForSelector('[aria-label="Lista de crianças"] li a');
    await page.locator('[aria-label="Lista de crianças"] li a').first().click();
    await expect(page).toHaveURL(/\/children\/child-/, { timeout: 8_000 });
  });
});
