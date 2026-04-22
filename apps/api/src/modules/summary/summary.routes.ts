import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../plugins/jwt.js';

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
}
