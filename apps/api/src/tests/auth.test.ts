import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../server.js';
import type { FastifyInstance } from 'fastify';
import { setupTestDb } from './setup.js';

let app: FastifyInstance;

beforeAll(async () => {
  process.env.DATABASE_URL = 'file:./test.db';
  process.env.JWT_SECRET = 'test-secret-key';
  app = await buildApp();
  await setupTestDb(app.prisma);
});

afterAll(async () => {
  await app.close();
});

describe('FR-01 — POST /auth/token', () => {
  it('retorna 200 + accessToken com credenciais corretas', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'tecnico@prefeitura.rio', password: 'painel@2024' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('expiresIn', 3600);
    expect(typeof body.accessToken).toBe('string');
  });

  it('retorna 401 com credenciais incorretas', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'tecnico@prefeitura.rio', password: 'senha-errada' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toMatchObject({ error: 'invalid_credentials' });
  });

  it('retorna 401 para email inexistente', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'nao-existe@test.com', password: 'qualquer' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('retorna 400 com body malformado (email inválido)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'nao-e-email', password: 'abc' },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body).toHaveProperty('error', 'validation_error');
  });
});

describe('FR-02 — Proteção de rotas', () => {
  it('retorna 401 para GET /children sem Authorization', async () => {
    const res = await app.inject({ method: 'GET', url: '/children' });
    expect(res.statusCode).toBe(401);
  });

  it('retorna 401 para token inválido', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/children',
      headers: { Authorization: 'Bearer token-invalido' },
    });
    expect(res.statusCode).toBe(401);
  });
});
