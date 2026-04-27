'use client';

import { useQuery } from '@tanstack/react-query';
import { getSummary } from '@/lib/api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))'];

export function ReviewStatusChart() {
  const { data, isLoading } = useQuery({ queryKey: ['summary'], queryFn: getSummary });

  const chartData = [
    { name: 'Revisadas', value: data?.reviewed ?? 0 },
    { name: 'Pendentes', value: data?.pending ?? 0 },
  ];

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <PieIcon className="h-4 w-4 text-primary" aria-hidden />
          Status de Revisão
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-40 animate-pulse rounded bg-muted" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))',
                  fontSize: 12,
                }}
                formatter={(v: unknown) => {
                  const n = v as number;
                  return [`${n} (${total ? Math.round((n / total) * 100) : 0}%)`, ''];
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
