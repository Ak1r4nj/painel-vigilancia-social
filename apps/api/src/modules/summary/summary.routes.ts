import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../plugins/jwt.js';
import { hasActiveAlerts } from '../../lib/alerts.js';

export async function summaryRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate);

  app.get('/', async (_request, reply) => {
    const [
      totalChildren,
      reviewed,
      healthAlertCount,
      educationAlertCount,
      socialAlertCount,
    ] = await Promise.all([
      app.prisma.child.count(),
      app.prisma.child.count({ where: { reviewedAt: { not: null } } }),
      app.prisma.healthRecord.count({
        where: {
          OR: [
            { vaccinesUpToDate: false },
            {
              lastVisit: {
                lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
      }),
      app.prisma.educationRecord.count({
        where: { attendanceRate: { lt: 75 } },
      }),
      app.prisma.socialRecord.count({
        where: {
          benefitStatus: { in: ['SUSPENDED', 'CANCELLED'] },
        },
      }),
    ]);

    return {
      totalChildren,
      reviewed,
      pending: totalChildren - reviewed,
      healthAlerts: healthAlertCount,
      educationAlerts: educationAlertCount,
      socialAlerts: socialAlertCount,
    };
  });

  // GET /summary/neighborhoods — dados agregados por bairro para o mapa de calor
  app.get('/neighborhoods', async () => {
    const children = await app.prisma.child.findMany({
      include: { health: true, education: true, social: true },
    });

    // Agrupa por bairro
    const map = new Map<string, { total: number; withAlerts: number; reviewed: number }>();

    for (const child of children) {
      const entry = map.get(child.neighborhood) ?? { total: 0, withAlerts: 0, reviewed: 0 };
      entry.total += 1;
      if (hasActiveAlerts(child)) entry.withAlerts += 1;
      if (child.reviewedAt !== null) entry.reviewed += 1;
      map.set(child.neighborhood, entry);
    }

    return Array.from(map.entries())
      .map(([neighborhood, stats]) => ({ neighborhood, ...stats }))
      .sort((a, b) => b.withAlerts - a.withAlerts); // maior risco primeiro
  });
}
