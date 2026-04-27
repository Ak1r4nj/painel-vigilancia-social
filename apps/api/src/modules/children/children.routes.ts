import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../plugins/jwt.js';
import { z } from 'zod';
import { parseAlerts, hasActiveAlerts } from '../../lib/alerts.js';

const listQuerySchema = z.object({
  neighborhood: z.string().optional(),
  hasAlerts: z.enum(['true', 'false']).optional(),
  alertArea: z.enum(['health', 'education', 'social']).optional(),
  reviewed: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function childrenRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate);

  app.get('/', async (request, reply) => {
    const query = listQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Parâmetros inválidos',
        details: query.error.flatten().fieldErrors,
      });
    }

    const { neighborhood, hasAlerts, alertArea, reviewed, page, pageSize } = query.data;

    const allChildren = await app.prisma.child.findMany({
      where: {
        ...(neighborhood ? { neighborhood } : {}),
        ...(reviewed === 'true'
          ? { reviewedAt: { not: null } }
          : reviewed === 'false'
            ? { reviewedAt: null }
            : {}),
      },
      include: {
        health: true,
        education: true,
        social: true,
      },
      orderBy: { fullName: 'asc' },
    });

    let filtered = allChildren;

    if (hasAlerts !== undefined) {
      const want = hasAlerts === 'true';
      filtered = filtered.filter((c) => hasActiveAlerts(c) === want);
    }

    // Filtra por área de alerta específica
    if (alertArea) {
      filtered = filtered.filter((c) => {
        if (alertArea === 'health')
          return c.health !== null && parseAlerts(c.health.alerts).length > 0;
        if (alertArea === 'education')
          return c.education !== null && parseAlerts(c.education.alerts).length > 0;
        if (alertArea === 'social')
          return c.social !== null && parseAlerts(c.social.alerts).length > 0;
        return true;
      });
    }

    filtered.sort((a, b) => {
      const aAlert = hasActiveAlerts(a) ? 0 : 1;
      const bAlert = hasActiveAlerts(b) ? 0 : 1;
      if (aAlert !== bAlert) return aAlert - bAlert;
      return a.fullName.localeCompare(b.fullName);
    });

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize).map((c) => ({
      id: c.id,
      fullName: c.fullName,
      birthDate: c.birthDate,
      neighborhood: c.neighborhood,
      reviewedAt: c.reviewedAt,
      reviewedBy: c.reviewedBy,
      alertCount: {
        health: c.health ? parseAlerts(c.health.alerts).length : null,
        education: c.education ? parseAlerts(c.education.alerts).length : null,
        social: c.social ? parseAlerts(c.social.alerts).length : null,
      },
      hasAlerts: hasActiveAlerts(c),
    }));

    return { items, total, page, pageSize };
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const child = await app.prisma.child.findUnique({
      where: { id },
      include: { health: true, education: true, social: true },
    });

    if (!child) {
      return reply.status(404).send({ error: 'not_found', message: 'Criança não encontrada' });
    }

    return {
      id: child.id,
      fullName: child.fullName,
      birthDate: child.birthDate,
      neighborhood: child.neighborhood,
      reviewedAt: child.reviewedAt,
      reviewedBy: child.reviewedBy,
      health: child.health
        ? {
            lastVisit: child.health.lastVisit,
            vaccinesUpToDate: child.health.vaccinesUpToDate,
            alerts: parseAlerts(child.health.alerts),
          }
        : null,
      education: child.education
        ? {
            school: child.education.school,
            attendanceRate: child.education.attendanceRate,
            alerts: parseAlerts(child.education.alerts),
          }
        : null,
      social: child.social
        ? {
            benefit: child.social.benefit,
            benefitStatus: child.social.benefitStatus,
            alerts: parseAlerts(child.social.alerts),
          }
        : null,
    };
  });

  app.patch('/:id/review', async (request, reply) => {
    const { id } = request.params as { id: string };

    const exists = await app.prisma.child.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      return reply.status(404).send({ error: 'not_found', message: 'Criança não encontrada' });
    }

    const updated = await app.prisma.child.update({
      where: { id },
      data: {
        reviewedAt: new Date(),
        reviewedBy: request.jwtUser!.preferred_username,
      },
    });

    return {
      id: updated.id,
      reviewedAt: updated.reviewedAt,
      reviewedBy: updated.reviewedBy,
    };
  });
}
