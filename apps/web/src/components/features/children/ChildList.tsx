'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getChildren, type ChildListParams } from '@/lib/api';
import { ChildCard } from './ChildCard';
import { ChildFilters } from './ChildFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const AREA_LABEL: Record<string, string> = {
  health: 'Alertas de Saúde',
  education: 'Alertas de Educação',
  social: 'Alertas de Assistência',
};

interface Props {
  /** Params controlados externamente (ex.: clique nos cards de resumo). */
  externalParams?: Partial<ChildListParams>;
  onExternalParamsClear?: () => void;
}

export function ChildList({ externalParams, onExternalParamsClear }: Props) {
  const [localParams, setLocalParams] = useState<ChildListParams>({ page: 1, pageSize: 20 });

  // Mescla: params locais (filtros do painel) + externos (clique nos cards)
  const params: ChildListParams = { ...localParams, ...externalParams, page: localParams.page };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['children', params],
    queryFn: () => getChildren(params),
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  function setPage(page: number) {
    setLocalParams((p) => ({ ...p, page }));
  }

  return (
    <section aria-label="Lista de crianças">
      {/* Região live: anuncia mudança de resultados para leitores de tela */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {!isLoading && data !== undefined && (
          data.total === 0
            ? 'Nenhuma criança encontrada com os filtros aplicados.'
            : `${data.total} ${data.total === 1 ? 'criança encontrada' : 'crianças encontradas'}.`
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">
          Crianças{' '}
          {data && (
            <span className="text-sm font-normal text-muted-foreground" aria-hidden>
              ({data.total} encontradas)
            </span>
          )}
        </h2>
      </div>

      {/* Chip de filtro externo ativo */}
      {externalParams && Object.keys(externalParams).length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {externalParams.alertArea
              ? AREA_LABEL[externalParams.alertArea]
              : externalParams.reviewed === true
                ? 'Revisadas'
                : externalParams.reviewed === false
                  ? 'Pendentes'
                  : 'Filtro ativo'}
          </span>
          {onExternalParamsClear && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                onExternalParamsClear();
                setLocalParams((p) => ({ ...p, page: 1 }));
              }}
              aria-label="Remover filtro do card de resumo"
            >
              <X className="h-3 w-3" aria-hidden />
              Limpar
            </Button>
          )}
        </div>
      )}

      <div className="mb-4">
        <ChildFilters
          params={localParams}
          onChange={(p) => {
            setLocalParams(p);
          }}
        />
      </div>

      {isError && (
        <p className="rounded-md bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          Erro ao carregar crianças. Tente novamente.
        </p>
      )}

      {isLoading && (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando...">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && data?.items.length === 0 && (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhuma criança encontrada com os filtros aplicados.
        </p>
      )}

      {!isLoading && data && data.items.length > 0 && (
        <>
          <ul className="space-y-3">
            {data.items.map((child) => (
              <li key={child.id}>
                <ChildCard child={child} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav
              className="mt-6 flex items-center justify-center gap-2"
              aria-label="Paginação"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((localParams.page ?? 1) - 1)}
                disabled={(localParams.page ?? 1) <= 1}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {localParams.page ?? 1} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((localParams.page ?? 1) + 1)}
                disabled={(localParams.page ?? 1) >= totalPages}
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
