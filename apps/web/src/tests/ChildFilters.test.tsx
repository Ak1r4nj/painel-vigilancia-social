import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChildFilters } from '@/components/features/children/ChildFilters';
import type { ChildListParams } from '@/lib/api';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function renderFilters(
  params: ChildListParams = { page: 1, pageSize: 20 },
  onChange = vi.fn(),
) {
  return { onChange, ...render(<ChildFilters params={params} onChange={onChange} />) };
}

// ──────────────────────────────────────────────
// Renderização inicial
// ──────────────────────────────────────────────
describe('ChildFilters — renderização inicial', () => {
  it('exibe os 3 selects de filtro', () => {
    renderFilters();

    expect(screen.getByLabelText('Bairro')).toBeInTheDocument();
    expect(screen.getByLabelText('Alertas')).toBeInTheDocument();
    expect(screen.getByLabelText('Revisão')).toBeInTheDocument();
  });

  it('selects começam com valor vazio ("Todos")', () => {
    renderFilters();

    expect(screen.getByLabelText<HTMLSelectElement>('Bairro').value).toBe('');
    expect(screen.getByLabelText<HTMLSelectElement>('Alertas').value).toBe('');
    expect(screen.getByLabelText<HTMLSelectElement>('Revisão').value).toBe('');
  });

  it('não exibe botão "Limpar filtros" quando nenhum filtro está ativo', () => {
    renderFilters();

    expect(screen.queryByText(/limpar filtros/i)).not.toBeInTheDocument();
  });

  it('exibe o select de bairro com as opções padrão', () => {
    renderFilters();

    const select = screen.getByLabelText('Bairro');
    expect(select).toBeInTheDocument();
    // Todos os 3 selects têm "Todos" como primeira opção
    const todosOptions = screen.getAllByRole('option', { name: 'Todos', hidden: true });
    expect(todosOptions.length).toBeGreaterThanOrEqual(1);
  });
});

// ──────────────────────────────────────────────
// Filtro por bairro
// ──────────────────────────────────────────────
describe('ChildFilters — filtro por bairro', () => {
  it('chama onChange com neighborhood selecionado', () => {
    const { onChange } = renderFilters();

    fireEvent.change(screen.getByLabelText('Bairro'), { target: { value: 'Maré' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ neighborhood: 'Maré', page: 1 }),
    );
  });

  it('chama onChange com neighborhood undefined ao selecionar "Todos"', () => {
    const { onChange } = renderFilters({ page: 1, pageSize: 20, neighborhood: 'Rocinha' });

    fireEvent.change(screen.getByLabelText('Bairro'), { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ neighborhood: undefined, page: 1 }),
    );
  });

  it('reseta page para 1 ao alterar bairro', () => {
    const { onChange } = renderFilters({ page: 3, pageSize: 20 });

    fireEvent.change(screen.getByLabelText('Bairro'), { target: { value: 'Rocinha' } });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });
});

// ──────────────────────────────────────────────
// Filtro por alertas
// ──────────────────────────────────────────────
describe('ChildFilters — filtro por alertas', () => {
  it('chama onChange com hasAlerts true ao selecionar "Com alertas"', () => {
    const { onChange } = renderFilters();

    fireEvent.change(screen.getByLabelText('Alertas'), { target: { value: 'true' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hasAlerts: true, page: 1 }),
    );
  });

  it('chama onChange com hasAlerts false ao selecionar "Sem alertas"', () => {
    const { onChange } = renderFilters();

    fireEvent.change(screen.getByLabelText('Alertas'), { target: { value: 'false' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hasAlerts: false, page: 1 }),
    );
  });

  it('chama onChange com hasAlerts undefined ao selecionar "Todos"', () => {
    const { onChange } = renderFilters({ page: 1, pageSize: 20, hasAlerts: true });

    fireEvent.change(screen.getByLabelText('Alertas'), { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hasAlerts: undefined, page: 1 }),
    );
  });
});

// ──────────────────────────────────────────────
// Filtro por revisão
// ──────────────────────────────────────────────
describe('ChildFilters — filtro por revisão', () => {
  it('chama onChange com reviewed true ao selecionar "Revisadas"', () => {
    const { onChange } = renderFilters();

    fireEvent.change(screen.getByLabelText('Revisão'), { target: { value: 'true' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ reviewed: true, page: 1 }),
    );
  });

  it('chama onChange com reviewed false ao selecionar "Pendentes"', () => {
    const { onChange } = renderFilters();

    fireEvent.change(screen.getByLabelText('Revisão'), { target: { value: 'false' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ reviewed: false, page: 1 }),
    );
  });
});

// ──────────────────────────────────────────────
// Botão Limpar filtros
// ──────────────────────────────────────────────
describe('ChildFilters — limpar filtros', () => {
  it('exibe botão "Limpar filtros" quando há filtro ativo', () => {
    renderFilters({ page: 1, pageSize: 20, neighborhood: 'Rocinha' });

    expect(screen.getByText(/limpar filtros/i)).toBeInTheDocument();
  });

  it('exibe botão "Limpar filtros" quando hasAlerts está ativo', () => {
    renderFilters({ page: 1, pageSize: 20, hasAlerts: true });

    expect(screen.getByText(/limpar filtros/i)).toBeInTheDocument();
  });

  it('exibe botão "Limpar filtros" quando reviewed está ativo', () => {
    renderFilters({ page: 1, pageSize: 20, reviewed: false });

    expect(screen.getByText(/limpar filtros/i)).toBeInTheDocument();
  });

  it('limpa todos os filtros ao clicar no botão', () => {
    const { onChange } = renderFilters({
      page: 2,
      pageSize: 20,
      neighborhood: 'Rocinha',
      hasAlerts: true,
      reviewed: false,
    });

    fireEvent.click(screen.getByText(/limpar filtros/i));

    expect(onChange).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
  });
});

// ──────────────────────────────────────────────
// Valores refletem params externos
// ──────────────────────────────────────────────
describe('ChildFilters — valores controlados', () => {
  it('select de bairro reflete o valor recebido via props', () => {
    renderFilters({ page: 1, pageSize: 20, neighborhood: 'Maré' });

    expect(screen.getByLabelText<HTMLSelectElement>('Bairro').value).toBe('Maré');
  });

  it('select de alertas reflete hasAlerts=true', () => {
    renderFilters({ page: 1, pageSize: 20, hasAlerts: true });

    expect(screen.getByLabelText<HTMLSelectElement>('Alertas').value).toBe('true');
  });

  it('select de revisão reflete reviewed=false', () => {
    renderFilters({ page: 1, pageSize: 20, reviewed: false });

    expect(screen.getByLabelText<HTMLSelectElement>('Revisão').value).toBe('false');
  });
});
