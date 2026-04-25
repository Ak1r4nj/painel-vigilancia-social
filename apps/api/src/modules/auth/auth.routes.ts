import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  // Rate limit específico para login: 5 tentativas/min por IP (NFR-01)
  app.post('/token', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
        errorResponseBuilder: () => ({
          error: 'rate_limit_exceeded',
          message: 'Muitas tentativas. Aguarde 1 minuto.',
        }),
      },
    },
  }, async (request, reply) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Dados inválidos',
        details: body.error.flatten().fieldErrors,
      });
    }

    const { email, password } = body.data;

    const technician = await app.prisma.technician.findUnique({ where: { email } });
    if (!technician) {
      return reply.status(401).send({ error: 'invalid_credentials', message: 'Credenciais inválidas' });
    }

    const valid = await bcrypt.compare(password, technician.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: 'invalid_credentials', message: 'Credenciais inválidas' });
    }

    const accessToken = await app.signToken({
      sub: email,
      preferred_username: email,
    });

    return reply.status(200).send({
      accessToken,
      expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 3600),
    });
  });
}
