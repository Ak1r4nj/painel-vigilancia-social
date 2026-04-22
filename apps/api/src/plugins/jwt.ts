import fp from 'fastify-plugin';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { FastifyRequest, FastifyReply } from 'fastify';

export interface JwtUser {
  sub: string;
  preferred_username: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    signToken: (payload: JwtUser) => Promise<string>;
    verifyToken: (token: string) => Promise<JwtUser & JWTPayload>;
  }
  interface FastifyRequest {
    jwtUser?: JwtUser;
  }
}

export const jwtPlugin = fp(async (app) => {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  );
  const expiresIn = Number(process.env.JWT_EXPIRES_IN ?? 3600);

  app.decorate('signToken', async (payload: JwtUser) => {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${expiresIn}s`)
      .sign(secret);
  });

  app.decorate('verifyToken', async (token: string) => {
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtUser & JWTPayload;
  });
});

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'unauthorized', message: 'Token ausente' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = await request.server.verifyToken(token);
    request.jwtUser = { sub: payload.sub!, preferred_username: payload.preferred_username };
  } catch (err: unknown) {
    const isExpired =
      err instanceof Error && err.message.toLowerCase().includes('expired');
    return reply.status(401).send({
      error: isExpired ? 'token_expired' : 'invalid_token',
      message: isExpired ? 'Token expirado' : 'Token inválido',
    });
  }
}
