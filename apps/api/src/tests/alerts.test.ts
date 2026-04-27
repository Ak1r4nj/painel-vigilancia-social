import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseAlerts, hasActiveAlerts, type ChildRecords } from '../lib/alerts.js';

// ──────────────────────────────────────────────
// parseAlerts
// ──────────────────────────────────────────────
describe('parseAlerts', () => {
  it('retorna array de strings para JSON válido', () => {
    expect(parseAlerts('["Vacinas em atraso","Última consulta > 180 dias"]')).toEqual([
      'Vacinas em atraso',
      'Última consulta > 180 dias',
    ]);
  });

  it('retorna array vazio para JSON de array vazio', () => {
    expect(parseAlerts('[]')).toEqual([]);
  });

  it('retorna array vazio para JSON inválido', () => {
    expect(parseAlerts('nao-e-json')).toEqual([]);
  });

  it('retorna array vazio para string vazia', () => {
    expect(parseAlerts('')).toEqual([]);
  });

  it('retorna array vazio para JSON mal-formado parcialmente', () => {
    expect(parseAlerts('["alerta sem fechamento')).toEqual([]);
  });

  it('retorna array para JSON com um único alerta', () => {
    expect(parseAlerts('["Benefício suspenso"]')).toEqual(['Benefício suspenso']);
  });
});

// ──────────────────────────────────────────────
// hasActiveAlerts — helpers
// ──────────────────────────────────────────────

/** Data N dias atrás */
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function makeChild(overrides: Partial<ChildRecords> = {}): ChildRecords {
  return {
    health: null,
    education: null,
    social: null,
    ...overrides,
  };
}

// ──────────────────────────────────────────────
// hasActiveAlerts — sem registros
// ──────────────────────────────────────────────
describe('hasActiveAlerts — criança sem registros', () => {
  it('retorna false quando todos os registros são null', () => {
    expect(hasActiveAlerts(makeChild())).toBe(false);
  });
});

// ──────────────────────────────────────────────
// hasActiveAlerts — saúde
// ──────────────────────────────────────────────
describe('hasActiveAlerts — saúde', () => {
  it('retorna true se vacinas não estão em dia', () => {
    const child = makeChild({
      health: { alerts: '[]', vaccinesUpToDate: false, lastVisit: daysAgo(10) },
    });
    expect(hasActiveAlerts(child)).toBe(true);
  });

  it('retorna false se vacinas em dia e consulta recente', () => {
    const child = makeChild({
      health: { alerts: '[]', vaccinesUpToDate: true, lastVisit: daysAgo(30) },
    });
    expect(hasActiveAlerts(child)).toBe(false);
  });

  it('retorna true se última consulta foi há mais de 180 dias', () => {
    const child = makeChild({
      health: { alerts: '[]', vaccinesUpToDate: true, lastVisit: daysAgo(181) },
    });
    expect(hasActiveAlerts(child)).toBe(true);
  });

  it('retorna false se última consulta foi há exatamente 180 dias (limite não atingido)', () => {
    // Usa fake timer para precisão no limite
    vi.useFakeTimers();
    const now = new Date('2025-01-01T12:00:00Z');
    vi.setSystemTime(now);

    const child = makeChild({
      health: {
        alerts: '[]',
        vaccinesUpToDate: true,
        lastVisit: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      },
    });
    // Exatamente 180 dias = 0 dias a mais, não ultrapassa o limiar > 180
    expect(hasActiveAlerts(child)).toBe(false);

    vi.useRealTimers();
  });

  it('retorna false se lastVisit é null (sem consulta registrada)', () => {
    const child = makeChild({
      health: { alerts: '[]', vaccinesUpToDate: true, lastVisit: null },
    });
    expect(hasActiveAlerts(child)).toBe(false);
  });

  it('retorna true por vacinas mesmo que consulta recente', () => {
    const child = makeChild({
      health: { alerts: '[]', vaccinesUpToDate: false, lastVisit: daysAgo(5) },
    });
    expect(hasActiveAlerts(child)).toBe(true);
  });
});

// ──────────────────────────────────────────────
// hasActiveAlerts — educação
// ──────────────────────────────────────────────
describe('hasActiveAlerts — educação', () => {
  it('retorna true se frequência < 75%', () => {
    const child = makeChild({
      education: { alerts: '[]', attendanceRate: 74.9 },
    });
    expect(hasActiveAlerts(child)).toBe(true);
  });

  it('retorna false se frequência = 75%', () => {
    const child = makeChild({
      education: { alerts: '[]', attendanceRate: 75 },
    });
    expect(hasActiveAlerts(child)).toBe(false);
  });

  it('retorna false se frequência > 75%', () => {
    const child = makeChild({
      education: { alerts: '[]', attendanceRate: 90 },
    });
    expect(hasActiveAlerts(child)).toBe(false);
  });

  it('retorna false se educação é null', () => {
    expect(hasActiveAlerts(makeChild({ education: null }))).toBe(false);
  });
});

// ──────────────────────────────────────────────
// hasActiveAlerts — assistência social
// ──────────────────────────────────────────────
describe('hasActiveAlerts — assistência social', () => {
  it('retorna true se benefício SUSPENDED', () => {
    const child = makeChild({
      social: { alerts: '[]', benefitStatus: 'SUSPENDED' },
    });
    expect(hasActiveAlerts(child)).toBe(true);
  });

  it('retorna true se benefício CANCELLED', () => {
    const child = makeChild({
      social: { alerts: '[]', benefitStatus: 'CANCELLED' },
    });
    expect(hasActiveAlerts(child)).toBe(true);
  });

  it('retorna false se benefício ACTIVE', () => {
    const child = makeChild({
      social: { alerts: '[]', benefitStatus: 'ACTIVE' },
    });
    expect(hasActiveAlerts(child)).toBe(false);
  });

  it('retorna false se social é null', () => {
    expect(hasActiveAlerts(makeChild({ social: null }))).toBe(false);
  });
});

// ──────────────────────────────────────────────
// hasActiveAlerts — combinações
// ──────────────────────────────────────────────
describe('hasActiveAlerts — combinações de registros', () => {
  it('retorna true com apenas alerta de saúde, educação e social OK', () => {
    const child = makeChild({
      health: { alerts: '[]', vaccinesUpToDate: false, lastVisit: daysAgo(10) },
      education: { alerts: '[]', attendanceRate: 80 },
      social: { alerts: '[]', benefitStatus: 'ACTIVE' },
    });
    expect(hasActiveAlerts(child)).toBe(true);
  });

  it('retorna true com apenas alerta de educação, saúde e social OK', () => {
    const child = makeChild({
      health: { alerts: '[]', vaccinesUpToDate: true, lastVisit: daysAgo(10) },
      education: { alerts: '[]', attendanceRate: 60 },
      social: { alerts: '[]', benefitStatus: 'ACTIVE' },
    });
    expect(hasActiveAlerts(child)).toBe(true);
  });

  it('retorna true com apenas alerta social, saúde e educação OK', () => {
    const child = makeChild({
      health: { alerts: '[]', vaccinesUpToDate: true, lastVisit: daysAgo(10) },
      education: { alerts: '[]', attendanceRate: 80 },
      social: { alerts: '[]', benefitStatus: 'CANCELLED' },
    });
    expect(hasActiveAlerts(child)).toBe(true);
  });

  it('retorna false quando todos os registros estão OK', () => {
    const child = makeChild({
      health: { alerts: '[]', vaccinesUpToDate: true, lastVisit: daysAgo(30) },
      education: { alerts: '[]', attendanceRate: 85 },
      social: { alerts: '[]', benefitStatus: 'ACTIVE' },
    });
    expect(hasActiveAlerts(child)).toBe(false);
  });

  it('retorna false com saúde OK e sem educação e social', () => {
    const child = makeChild({
      health: { alerts: '[]', vaccinesUpToDate: true, lastVisit: daysAgo(10) },
      education: null,
      social: null,
    });
    expect(hasActiveAlerts(child)).toBe(false);
  });

  it('retorna true quando múltiplos alertas estão presentes', () => {
    const child = makeChild({
      health: { alerts: '[]', vaccinesUpToDate: false, lastVisit: daysAgo(200) },
      education: { alerts: '[]', attendanceRate: 50 },
      social: { alerts: '[]', benefitStatus: 'SUSPENDED' },
    });
    expect(hasActiveAlerts(child)).toBe(true);
  });
});

afterEach(() => {
  vi.useRealTimers();
});
