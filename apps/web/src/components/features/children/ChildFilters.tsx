'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import type { ChildListParams } from '@/lib/api';

const NEIGHBORHOODS = [
  'Maré', 'Rocinha', 'Complexo do Alemão', 'Jacarezinho', 'Manguinhos',
  'Cidade de Deus', 'Vigário Geral', 'Acari', 'Coelho Neto', 'Parada de Lucas',
];

interface Props {
  params: ChildListParams;
  onChange: (p: ChildListParams) => void;
}

export function ChildFilters({ params, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const hasActive =
    params.neighborhood !== undefined ||
    params.hasAlerts !== undefined ||
    params.reviewed !== undefined;

  function clear() {
    onChange({ page: 1, pageSize: params.pageSize });
  }

  const FilterPanel = (
    <div className="flex flex-wrap gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="neighborhood-filter">
          Bairro
        </label>
        <select
          id="neighborhood-filter"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={params.neighborhood ?? ''}
          onChange={(e) =>
            onChange({ ...params, neighborhood: e.target.value || undefined, page: 1 })
          }
        >
          <option value="">Todos</option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="alerts-filter">
          Alertas
        </label>
        <select
          id="alerts-filter"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={params.hasAlerts === undefined ? '' : String(params.hasAlerts)}
          onChange={(e) =>
            onChange({
              ...params,
              hasAlerts: e.target.value === '' ? undefined : e.target.value === 'true',
              page: 1,
            })
          }
        >
          <option value="">Todos</option>
          <option value="true">Com alertas</option>
          <option value="false">Sem alertas</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="reviewed-filter">
          Revisão
        </label>
        <select
          id="reviewed-filter"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={params.reviewed === undefined ? '' : String(params.reviewed)}
          onChange={(e) =>
            onChange({
              ...params,
              reviewed: e.target.value === '' ? undefined : e.target.value === 'true',
              page: 1,
            })
          }
        >
          <option value="">Todos</option>
          <option value="false">Pendentes</option>
          <option value="true">Revisadas</option>
        </select>
      </div>

      {hasActive && (
        <div className="flex items-end">
          <Button variant="ghost" size="sm" onClick={clear} className="h-9 gap-1 text-xs">
            <X className="h-3 w-3" aria-hidden />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Mobile: toggle button (only visible on small screens) */}
      <div className="md:hidden mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="filter-panel"
          className="gap-2"
        >
          <Filter className="h-4 w-4" aria-hidden />
          Filtros
          {hasActive && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Filters: rendered once — hidden on mobile unless open, always visible on desktop */}
      <div
        id="filter-panel"
        className={open ? 'block md:block' : 'hidden md:block'}
      >
        {FilterPanel}
      </div>
    </div>
  );
}
