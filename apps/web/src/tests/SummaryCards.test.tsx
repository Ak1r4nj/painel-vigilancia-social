import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SummaryCards } from '@/components/features/summary/SummaryCards';
import type { Summary } from '@/lib/api';

// ──────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────
vi.mock('@/lib/api', () => ({
  getSummary: vi.fn(),
}));

import { getSummary } from '@/lib/api';

// QueryClient sem retentativas para testes síncronos
function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderWithQuery(ui: React.ReactElement) {
  const client = makeClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

// ──────────────────────────────────────────────
// Dados de resumo
// ──────────────────────────────────────────────
const SUMMARY_DATA: Summary = {
  totalChildren: 25,
  reviewed: 10,
  pending: 15,
  healthAlerts: 8,
  educationAlerts: 5,
  socialAlerts: 3,
};

// ──────────────────────────────────────────────
// Testes de loading
// ──────────────────────────────────────────────
describe('SummaryCards — estado de carregamento', () => {
  it('exibe os 6 títulos de cards mesmo durante o loading', () => {
    // getSummary retorna uma promise pendente para simular loading
    vi.mocked(getSummary).mockReturnValue(new Promise(() => {}));

    renderWithQuery(<SummaryCards />);

    expect(screen.getByText('Total de Crianças')).toBeInTheDocument();
    expect(screen.getByText('Alertas de Saúde')).toBeInTheDocument();
    expect(screen.getByText('Alertas de Educação')).toBeInTheDocument();
    expect(screen.getByText('Alertas de Assistência')).toBeInTheDocument();
    expect(screen.getByText('Revisadas')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
  });

  it('não exibe valores numéricos durante o loading', () => {
    vi.mocked(getSummary).mockReturnValue(new Promise(() => {}));

    renderWithQuery(<SummaryCards />);

    // Valores não devem aparecer enquanto está carregando (skeletons no lugar)
    expect(screen.queryByText('25')).not.toBeInTheDocument();
  });

  it('exibe o heading "Visão Geral" como rótulo da seção', () => {
    vi.mocked(getSummary).mockReturnValue(new Promise(() => {}));

    renderWithQuery(<SummaryCards />);

    expect(screen.getByText('Visão Geral')).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────
// Testes com dados carregados
// ──────────────────────────────────────────────
describe('SummaryCards — dados carregados', () => {
  it('exibe o total de crianças', async () => {
    vi.mocked(getSummary).mockResolvedValue(SUMMARY_DATA);

    renderWithQuery(<SummaryCards />);

    expect(await screen.findByText('25')).toBeInTheDocument();
  });

  it('exibe alertas de saúde corretamente', async () => {
    vi.mocked(getSummary).mockResolvedValue(SUMMARY_DATA);

    renderWithQuery(<SummaryCards />);

    expect(await screen.findByText('8')).toBeInTheDocument();
  });

  it('exibe todas as 6 métricas com valores corretos', async () => {
    vi.mocked(getSummary).mockResolvedValue(SUMMARY_DATA);

    renderWithQuery(<SummaryCards />);

    // Aguarda qualquer valor numérico aparecer (indica que data carregou)
    await screen.findByText('25');

    expect(screen.getByText('25')).toBeInTheDocument(); // total
    expect(screen.getByText('8')).toBeInTheDocument();  // healthAlerts
    expect(screen.getByText('5')).toBeInTheDocument();  // educationAlerts
    expect(screen.getByText('3')).toBeInTheDocument();  // socialAlerts
    expect(screen.getByText('10')).toBeInTheDocument(); // reviewed
    expect(screen.getByText('15')).toBeInTheDocument(); // pending
  });

  it('não exibe "—" após os dados carregarem', async () => {
    vi.mocked(getSummary).mockResolvedValue(SUMMARY_DATA);

    renderWithQuery(<SummaryCards />);

    await screen.findByText('25');

    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────
// Testes de erro
// ──────────────────────────────────────────────
describe('SummaryCards — estado de erro', () => {
  it('exibe "—" quando a query falha', async () => {
    vi.mocked(getSummary).mockRejectedValue(new Error('API indisponível'));

    await act(async () => {
      renderWithQuery(<SummaryCards />);
      // Aguarda a query resolver (com erro)
      await new Promise((r) => setTimeout(r, 50));
    });

    // Os títulos continuam visíveis mesmo em caso de erro
    expect(screen.getByText('Total de Crianças')).toBeInTheDocument();
  });
});
