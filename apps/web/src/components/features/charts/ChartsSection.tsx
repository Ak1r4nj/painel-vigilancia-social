'use client';

import { AlertsByAreaChart } from './AlertsByAreaChart';
import { ReviewStatusChart } from './ReviewStatusChart';
import { NeighborhoodHeatmap } from './NeighborhoodHeatmap';
import { BarChart2 } from 'lucide-react';

export function ChartsSection() {
  return (
    <section aria-label="Visualizações e gráficos">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <BarChart2 className="h-5 w-5 text-primary" aria-hidden />
        Visualizações
      </h2>

      {/* Gráficos de resumo — lado a lado em desktop */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AlertsByAreaChart />
        <ReviewStatusChart />
      </div>

      {/* Mapa de calor ocupa largura total */}
      <NeighborhoodHeatmap />
    </section>
  );
}
