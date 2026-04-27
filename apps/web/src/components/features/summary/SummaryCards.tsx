'use client';

import { useQuery } from '@tanstack/react-query';
import { getSummary, type ChildListParams } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, GraduationCap, HandHeart, Users, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
  active: boolean;
  onClick?: () => void;
}

function StatCard({ title, value, icon, color, loading, active, onClick }: StatCardProps) {
  const isClickable = !!onClick;

  return (
    <Card
      role={isClickable ? 'button' : 'figure'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={
        loading
          ? `${title}: carregando`
          : `${title}: ${value ?? 'sem dados'}${isClickable ? ' — clique para filtrar' : ''}`
      }
      aria-pressed={isClickable ? active : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'transition-all',
        isClickable && 'cursor-pointer select-none hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active && 'ring-2 ring-primary ring-offset-2',
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground" aria-hidden>
          {title}
        </CardTitle>
        <span className={cn(color, active && 'scale-110 transition-transform')} aria-hidden>
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded bg-muted" aria-hidden />
        ) : (
          <p className="text-3xl font-bold" aria-hidden>
            {value ?? '—'}
          </p>
        )}
        {active && (
          <p className="mt-1 text-xs font-medium text-primary">Filtro ativo</p>
        )}
      </CardContent>
    </Card>
  );
}

interface SummaryCardsProps {
  activeFilter?: Partial<ChildListParams>;
  onFilter?: (params: Partial<ChildListParams>) => void;
}

export function SummaryCards({ activeFilter, onFilter }: SummaryCardsProps) {
  const { data, isLoading } = useQuery({ queryKey: ['summary'], queryFn: getSummary });

  function handleFilter(params: Partial<ChildListParams>) {
    if (!onFilter) return;
    // Clicou no card já ativo → limpa o filtro
    const isSame =
      activeFilter?.alertArea === params.alertArea &&
      activeFilter?.reviewed === params.reviewed &&
      activeFilter?.hasAlerts === params.hasAlerts;
    onFilter(isSame ? {} : params);
  }

  const cards = [
    {
      title: 'Total de Crianças',
      value: data?.totalChildren,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      filter: {} as Partial<ChildListParams>,
    },
    {
      title: 'Alertas de Saúde',
      value: data?.healthAlerts,
      icon: <Heart className="h-5 w-5" />,
      color: 'text-red-500',
      filter: { alertArea: 'health' } as Partial<ChildListParams>,
    },
    {
      title: 'Alertas de Educação',
      value: data?.educationAlerts,
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'text-amber-500',
      filter: { alertArea: 'education' } as Partial<ChildListParams>,
    },
    {
      title: 'Alertas de Assistência',
      value: data?.socialAlerts,
      icon: <HandHeart className="h-5 w-5" />,
      color: 'text-orange-500',
      filter: { alertArea: 'social' } as Partial<ChildListParams>,
    },
    {
      title: 'Revisadas',
      value: data?.reviewed,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600',
      filter: { reviewed: true } as Partial<ChildListParams>,
    },
    {
      title: 'Pendentes',
      value: data?.pending,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-muted-foreground',
      filter: { reviewed: false } as Partial<ChildListParams>,
    },
  ];

  return (
    <section aria-label="Resumo geral">
      <h2 className="mb-4 text-lg font-semibold">Visão Geral</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => {
          const isActive =
            c.filter.alertArea !== undefined
              ? activeFilter?.alertArea === c.filter.alertArea
              : c.filter.reviewed !== undefined
                ? activeFilter?.reviewed === c.filter.reviewed
                : Object.keys(c.filter).length === 0 &&
                  !activeFilter?.alertArea &&
                  activeFilter?.reviewed === undefined;

          return (
            <StatCard
              key={c.title}
              title={c.title}
              value={c.value}
              icon={c.icon}
              color={c.color}
              loading={isLoading}
              active={isActive}
              onClick={onFilter ? () => handleFilter(c.filter) : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
