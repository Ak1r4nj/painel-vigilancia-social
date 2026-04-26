import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChildCard } from '@/components/features/children/ChildCard';
import type { ChildSummary } from '@/lib/api';

// next/link não existe no jsdom — mock simples que renderiza um <a>
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// ──────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────
const BASE_CHILD: ChildSummary = {
  id: 'child-001',
  fullName: 'Ana Beatriz da Maré',
  birthDate: '2014-06-15T00:00:00.000Z', // ~10 anos em 2025
  neighborhood: 'Maré',
  reviewedAt: null,
  reviewedBy: null,
  alertCount: { health: 0, education: 0, social: 0 },
  hasAlerts: false,
};

const CHILD_WITH_ALERTS: ChildSummary = {
  ...BASE_CHILD,
  id: 'child-002',
  fullName: 'Bruno Silva do Complexo',
  alertCount: { health: 2, education: 1, social: 0 },
  hasAlerts: true,
};

const CHILD_REVIEWED: ChildSummary = {
  ...BASE_CHILD,
  id: 'child-003',
  fullName: 'Carla Mendes Revisada',
  reviewedAt: '2025-04-01T14:00:00.000Z',
  reviewedBy: 'tecnico@prefeitura.rio',
};

// ──────────────────────────────────────────────
// Renderização básica
// ──────────────────────────────────────────────
describe('ChildCard — renderização básica', () => {
  it('exibe o nome completo da criança', () => {
    render(<ChildCard child={BASE_CHILD} />);
    expect(screen.getByText('Ana Beatriz da Maré')).toBeInTheDocument();
  });

  it('exibe o bairro da criança', () => {
    render(<ChildCard child={BASE_CHILD} />);
    expect(screen.getByText('Maré')).toBeInTheDocument();
  });

  it('exibe a idade calculada da criança', () => {
    render(<ChildCard child={BASE_CHILD} />);
    // Texto "N anos" — o número exato depende da data corrente, mas deve estar presente
    expect(screen.getByText(/\d+ anos/)).toBeInTheDocument();
  });

  it('gera link para a página de detalhe com o ID correto', () => {
    render(<ChildCard child={BASE_CHILD} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/children/child-001');
  });
});

// ──────────────────────────────────────────────
// Estado de alertas
// ──────────────────────────────────────────────
describe('ChildCard — estado de alertas', () => {
  it('exibe badge "OK" quando não há alertas', () => {
    render(<ChildCard child={BASE_CHILD} />);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('exibe badge de alertas quando hasAlerts é true', () => {
    render(<ChildCard child={CHILD_WITH_ALERTS} />);
    // Badge mostra a contagem total de alertas
    expect(screen.getByText(/alerta/i)).toBeInTheDocument();
  });

  it('exibe contagem total correta de alertas (health + education + social)', () => {
    render(<ChildCard child={CHILD_WITH_ALERTS} />);
    // 2 saúde + 1 educação = 3 alertas
    expect(screen.getByText(/3 alertas/i)).toBeInTheDocument();
  });

  it('não exibe badge OK quando há alertas', () => {
    render(<ChildCard child={CHILD_WITH_ALERTS} />);
    expect(screen.queryByText('OK')).not.toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────
// Estado de revisão
// ──────────────────────────────────────────────
describe('ChildCard — estado de revisão', () => {
  it('exibe "Pendente" quando reviewedAt é null', () => {
    render(<ChildCard child={BASE_CHILD} />);
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('exibe data de revisão quando reviewedAt está preenchido', () => {
    render(<ChildCard child={CHILD_REVIEWED} />);
    // Não deve mostrar "Pendente" para criança revisada
    expect(screen.queryByText('Pendente')).not.toBeInTheDocument();
    // Deve mostrar algum texto relacionado à data de revisão
    expect(screen.getByText(/revisada em/i)).toBeInTheDocument();
  });
});
