/**
 * Funções puras para cálculo de alertas de vigilância social.
 * Extraídas para permitir teste unitário isolado do banco de dados.
 */

export interface ChildRecords {
  health: {
    alerts: string;
    vaccinesUpToDate: boolean;
    lastVisit: Date | null;
  } | null;
  education: {
    alerts: string;
    attendanceRate: number;
  } | null;
  social: {
    alerts: string;
    benefitStatus: string;
  } | null;
}

/**
 * Desserializa alertas armazenados como JSON string no banco.
 * Retorna array vazio se o JSON for inválido.
 */
export function parseAlerts(json: string): string[] {
  try {
    return JSON.parse(json) as string[];
  } catch {
    return [];
  }
}

/**
 * Determina se um registro de criança possui algum alerta ativo:
 * - Vacinas em atraso
 * - Última consulta > 180 dias
 * - Frequência escolar < 75%
 * - Benefício suspenso ou cancelado
 */
export function hasActiveAlerts(child: ChildRecords): boolean {
  if (child.health) {
    if (!child.health.vaccinesUpToDate) return true;
    if (
      child.health.lastVisit &&
      (Date.now() - child.health.lastVisit.getTime()) / (1000 * 60 * 60 * 24) > 180
    )
      return true;
  }
  if (child.education && child.education.attendanceRate < 75) return true;
  if (
    child.social &&
    (child.social.benefitStatus === 'SUSPENDED' || child.social.benefitStatus === 'CANCELLED')
  )
    return true;
  return false;
}
