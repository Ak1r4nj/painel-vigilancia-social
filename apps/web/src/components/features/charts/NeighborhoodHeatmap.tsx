'use client';

import { useQuery } from '@tanstack/react-query';
import { getNeighborhoodStats } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

/** Interpola entre verde (#22c55e) e vermelho (#ef4444) conforme intensidade (0–1). */
function alertColor(ratio: number): string {
  // Verde → Amarelo → Vermelho
  if (ratio < 0.5) {
    const t = ratio * 2; // 0→1 no trecho verde-amarelo
    const r = Math.round(34 + (234 - 34) * t);
    const g = Math.round(197 + (179 - 197) * t);
    const b = Math.round(94 + (8 - 94) * t);
    return `rgb(${r},${g},${b})`;
  } else {
    const t = (ratio - 0.5) * 2; // 0→1 no trecho amarelo-vermelho
    const r = Math.round(234 + (239 - 234) * t);
    const g = Math.round(179 + (68 - 179) * t);
    const b = Math.round(8 + (68 - 8) * t);
    return `rgb(${r},${g},${b})`;
  }
}

interface TooltipPayload {
  payload: { neighborhood: string; total: number; withAlerts: number; reviewed: number };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const pct = d.total > 0 ? Math.round((d.withAlerts / d.total) * 100) : 0;
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-md">
      <p className="font-semibold text-foreground mb-1">{d.neighborhood}</p>
      <p className="text-muted-foreground">Total: {d.total} crianças</p>
      <p className="text-muted-foreground">Com alertas: {d.withAlerts} ({pct}%)</p>
      <p className="text-muted-foreground">Revisadas: {d.reviewed}</p>
    </div>
  );
}

export function NeighborhoodHeatmap() {
  const { data, isLoading } = useQuery({
    queryKey: ['neighborhood-stats'],
    queryFn: getNeighborhoodStats,
  });

  const maxAlerts = data ? Math.max(...data.map((d) => d.withAlerts), 1) : 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-primary" aria-hidden />
          Mapa de Calor por Bairro
          <span className="ml-auto flex items-center gap-2 text-xs font-normal text-muted-foreground">
            <span className="inline-block h-2.5 w-10 rounded bg-gradient-to-r from-[#22c55e] via-[#eab308] to-[#ef4444]" />
            Baixo → Alto risco
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-52 animate-pulse rounded bg-muted" />
        ) : !data?.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Sem dados de bairros.</p>
        ) : (
          <ResponsiveContainer width="100%" height={data.length * 36 + 24}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 48, left: 4, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                domain={[0, maxAlerts + 1]}
              />
              <YAxis
                type="category"
                dataKey="neighborhood"
                width={120}
                tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
              <Bar dataKey="withAlerts" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {data.map((d) => (
                  <Cell
                    key={d.neighborhood}
                    fill={alertColor(d.withAlerts / maxAlerts)}
                  />
                ))}
                <LabelList
                  dataKey="withAlerts"
                  position="right"
                  style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  formatter={(v: unknown) => ((v as number) > 0 ? (v as number) : '')}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
