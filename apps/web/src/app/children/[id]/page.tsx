'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChild, reviewChild } from '@/lib/api';
import { AuthGuard } from '@/components/features/auth/AuthGuard';
import { Navbar } from '@/components/features/auth/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { formatDate, formatDateTime, calcAge } from '@/lib/utils';
import {
  Heart,
  GraduationCap,
  HandHeart,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  ClipboardCheck,
  MapPin,
  Calendar,
} from 'lucide-react';

function AlertsSection({
  title,
  icon,
  alerts,
  hasData,
}: {
  title: string;
  icon: React.ReactNode;
  alerts: string[];
  hasData: boolean;
}) {
  if (!hasData) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {icon}
            {title}
            <Badge variant="unknown" className="ml-auto gap-1">
              <HelpCircle className="h-3 w-3" aria-hidden />
              Sem dados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum registro cadastrado para esta área.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasAlerts = alerts.length > 0;

  return (
    <Card className={hasAlerts ? 'border-destructive/50' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          {hasAlerts ? (
            <Badge variant="destructive" className="ml-auto gap-1">
              <AlertTriangle className="h-3 w-3" aria-hidden />
              {alerts.length} alerta{alerts.length !== 1 ? 's' : ''}
            </Badge>
          ) : (
            <Badge variant="success" className="ml-auto gap-1">
              <CheckCircle className="h-3 w-3" aria-hidden />
              OK
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      {hasAlerts && (
        <CardContent>
          <ul className="space-y-1">
            {alerts.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {a}
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: child, isLoading, isError } = useQuery({
    queryKey: ['child', id],
    queryFn: () => getChild(id),
  });

  const { mutate: review, isPending: isReviewing } = useMutation({
    mutationFn: () => reviewChild(id),
    onSuccess: (data) => {
      queryClient.setQueryData(['child', id], (old: typeof child) =>
        old ? { ...old, reviewedAt: data.reviewedAt, reviewedBy: data.reviewedBy } : old,
      );
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast({ title: 'Revisão registrada', description: `Revisada em ${formatDateTime(data.reviewedAt)}` });
    },
    onError: () => {
      toast({ title: 'Erro ao registrar revisão', variant: 'destructive' });
    },
  });

  return (
    <AuthGuard>
      <Navbar />
      <main className="container py-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar
        </Button>

        {isError && (
          <p className="rounded-md bg-destructive/10 p-4 text-sm text-destructive" role="alert">
            Erro ao carregar dados da criança.
          </p>
        )}

        {isLoading && (
          <div className="space-y-4" aria-busy="true" aria-label="Carregando...">
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
          </div>
        )}

        {!isLoading && child && (
          <div className="space-y-4">
            {/* Header */}
            <Card>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl font-bold">{child.fullName}</h1>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" aria-hidden />
                      {calcAge(child.birthDate)} anos ({formatDate(child.birthDate)})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {child.neighborhood}
                    </span>
                  </div>
                  {child.reviewedAt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Revisada em {formatDateTime(child.reviewedAt)}{' '}
                      {child.reviewedBy && `por ${child.reviewedBy}`}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => review()}
                  disabled={isReviewing}
                  className="min-w-[160px] gap-2"
                  aria-label="Registrar revisão desta criança"
                >
                  <ClipboardCheck className="h-4 w-4" aria-hidden />
                  {isReviewing ? 'Registrando…' : child.reviewedAt ? 'Revisitar' : 'Marcar como revisada'}
                </Button>
              </CardContent>
            </Card>

            {/* Três áreas */}
            <AlertsSection
              title="Saúde"
              icon={<Heart className="h-4 w-4 text-red-500" aria-hidden />}
              hasData={child.health !== null}
              alerts={child.health?.alerts ?? []}
            />
            <AlertsSection
              title="Educação"
              icon={<GraduationCap className="h-4 w-4 text-amber-500" aria-hidden />}
              hasData={child.education !== null}
              alerts={child.education?.alerts ?? []}
            />
            <AlertsSection
              title="Assistência Social"
              icon={<HandHeart className="h-4 w-4 text-orange-500" aria-hidden />}
              hasData={child.social !== null}
              alerts={child.social?.alerts ?? []}
            />

            {/* Dados detalhados */}
            {child.health && (
              <Card>
                <CardContent className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Última consulta</p>
                    <p className="text-sm font-medium">{formatDate(child.health.lastVisit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vacinas em dia</p>
                    <p className="text-sm font-medium">
                      {child.health.vaccinesUpToDate ? 'Sim' : 'Não'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {child.education && (
              <Card>
                <CardContent className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Escola</p>
                    <p className="text-sm font-medium">{child.education.school}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Frequência</p>
                    <p className="text-sm font-medium">
                      {child.education.attendanceRate.toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {child.social && (
              <Card>
                <CardContent className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Benefício</p>
                    <p className="text-sm font-medium">{child.social.benefit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge
                      variant={
                        child.social.benefitStatus === 'ACTIVE'
                          ? 'success'
                          : child.social.benefitStatus === 'SUSPENDED'
                            ? 'warning'
                            : 'destructive'
                      }
                    >
                      {child.social.benefitStatus === 'ACTIVE'
                        ? 'Ativo'
                        : child.social.benefitStatus === 'SUSPENDED'
                          ? 'Suspenso'
                          : 'Cancelado'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
