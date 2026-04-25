import Link from 'next/link';
import { AlertTriangle, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, calcAge } from '@/lib/utils';
import type { ChildSummary } from '@/lib/api';

interface Props {
  child: ChildSummary;
}

export function ChildCard({ child }: Props) {
  const age = calcAge(child.birthDate);
  const alertTotal =
    (child.alertCount.health ?? 0) +
    (child.alertCount.education ?? 0) +
    (child.alertCount.social ?? 0);

  return (
    <Link href={`/children/${child.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
      <Card className={`transition-shadow hover:shadow-md ${child.hasAlerts ? 'border-l-4 border-l-destructive' : ''}`}>
        <CardContent className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{child.fullName}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden />
                {age} anos
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {child.neighborhood}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {child.hasAlerts ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" aria-hidden />
                {alertTotal} alerta{alertTotal !== 1 ? 's' : ''}
              </Badge>
            ) : (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" aria-hidden />
                OK
              </Badge>
            )}

            {child.reviewedAt ? (
              <span className="text-xs text-muted-foreground">
                Revisada em {formatDate(child.reviewedAt)}
              </span>
            ) : (
              <span className="text-xs text-amber-600 font-medium">Pendente</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
