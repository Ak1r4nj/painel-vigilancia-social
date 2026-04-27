'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getChildren, type ChildListParams } from '@/lib/api';
import { ChildCard } from './ChildCard';
import { ChildFilters } from './ChildFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ChildList() {
  const [params, setParams] = useState<ChildListParams>({ page: 1, pageSize: 20 });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['children', params],
    queryFn: () => getChildren(params),
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

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
            <span className="text-sm font-normal text-muted-foreground" aria-hidden>({data.total} encontradas)</span>
          )}
        </h2>
      </div>

      <div className="mb-4">
        <ChildFilters params={params} onChange={setParams} />
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
                onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
                disabled={(params.page ?? 1) <= 1}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {params.page ?? 1} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
                disabled={(params.page ?? 1) >= totalPages}
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
