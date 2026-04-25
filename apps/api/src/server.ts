import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { prismaPlugin } from './plugins/prisma.js';
import { jwtPlugin } from './plugins/jwt.js';
import { errorHandler } from './plugins/error-handler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { childrenRoutes } from './modules/children/children.routes.js';
import { summaryRoutes } from './modules/summary/summary.routes.js';

const PORT = Number(process.env.PORT ?? 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

export async function buildApp() {
  const app = Fastify({ logger: { level: 'info' } });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  await app.register(prismaPlugin);
  await app.register(jwtPlugin);

  app.setErrorHandler(errorHandler);

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(childrenRoutes, { prefix: '/children' });
  await app.register(summaryRoutes, { prefix: '/summary' });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const app = await buildApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
  app.log.info(`API rodando em http://0.0.0.0:${PORT}`);
}
