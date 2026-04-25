'use client';

import { useQuery } from '@tanstack/react-query';
import { getSummary } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, GraduationCap, HandHeart, Users, CheckCircle, Clock } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}

function StatCard({ title, value, icon, color, loading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className={color} aria-hidden>
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-3xl font-bold">{value ?? '—'}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function SummaryCards() {
  const { data, isLoading } = useQuery({ queryKey: ['summary'], queryFn: getSummary });

  const cards = [
    {
      title: 'Total de Crianças',
      value: data?.totalChildren,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
    },
    {
      title: 'Alertas de Saúde',
      value: data?.healthAlerts,
      icon: <Heart className="h-5 w-5" />,
      color: 'text-red-500',
    },
    {
      title: 'Alertas de Educação',
      value: data?.educationAlerts,
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'text-amber-500',
    },
    {
      title: 'Alertas de Assistência',
      value: data?.socialAlerts,
      icon: <HandHeart className="h-5 w-5" />,
      color: 'text-orange-500',
    },
    {
      title: 'Revisadas',
      value: data?.reviewed,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600',
    },
    {
      title: 'Pendentes',
      value: data?.pending,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <section aria-label="Resumo geral">
      <h2 className="mb-4 text-lg font-semibold">Visão Geral</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <StatCard key={c.title} {...c} loading={isLoading} />
        ))}
      </div>
    </section>
  );
}
