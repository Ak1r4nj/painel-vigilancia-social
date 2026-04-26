'use client';

import { useQuery } from '@tanstack/react-query';
import { getSummary } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

const COLORS = ['hsl(var(--destructive))', 'hsl(37 91% 55%)', 'hsl(25 95% 53%)'];

export function AlertsByAreaChart() {
  const { data, isLoading } = useQuery({ queryKey: ['summary'], queryFn: getSummary });

  const chartData = [
    { area: 'Saúde', alertas: data?.healthAlerts ?? 0 },
    { area: 'Educação', alertas: data?.educationAlerts ?? 0 },
    { area: 'Assistência', alertas: data?.socialAlerts ?? 0 },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <BarChart2 className="h-4 w-4 text-primary" aria-hidden />
          Alertas por Área
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-40 animate-pulse rounded bg-muted" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="area"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))',
                  fontSize: 12,
                }}
                formatter={(v: unknown) => [v as number, 'Alertas']}
              />
              <Bar dataKey="alertas" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
