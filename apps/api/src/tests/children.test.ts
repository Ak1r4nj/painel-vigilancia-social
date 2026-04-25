import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../server.js';
import type { FastifyInstance } from 'fastify';
import { setupTestDb } from './setup.js';

let app: FastifyInstance;
let token: string;

beforeAll(async () => {
  process.env.DATABASE_URL = 'file:./test.db';
  process.env.JWT_SECRET = 'test-secret-key';
  app = await buildApp();
  await setupTestDb(app.prisma);

  const res = await app.inject({
    method: 'POST',
    url: '/auth/token',
    payload: { email: 'tecnico@prefeitura.rio', password: 'painel@2024' },
  });
  token = res.json<{ accessToken: string }>().accessToken;
});

afterAll(async () => {
  await app.close();
});

const authHeader = () => ({ Authorization: `Bearer ${token}` });

describe('FR-03 — GET /children', () => {
  it('retorna lista paginada com estrutura correta', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/children',
      headers: authHeader(),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('pageSize');
    expect(Array.isArray(body.items)).toBe(true);
  });

  it('filtra por bairro', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/children?neighborhood=Maré',
      headers: authHeader(),
    });
    const body = res.json();
    expect(body.items.every((c: { neighborhood: string }) => c.neighborhood === 'Maré')).toBe(true);
  });

  it('filtra por hasAlerts=true', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/children?hasAlerts=true',
      headers: authHeader(),
    });
    const body = res.json();
    expect(body.items.every((c: { hasAlerts: boolean }) => c.hasAlerts)).toBe(true);
  });

  it('filtra por hasAlerts=false', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/children?hasAlerts=false',
      headers: authHeader(),
    });
    const body = res.json();
    expect(body.items.every((c: { hasAlerts: boolean }) => !c.hasAlerts)).toBe(true);
  });

  it('retorna 0 resultados para filtro sem match', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/children?neighborhood=BairroInexistente',
      headers: authHeader(),
    });
    const body = res.json();
    expect(body.items).toHaveLength(0);
    expect(body.total).toBe(0);
  });
});

describe('FR-04 — GET /children/:id', () => {
  it('retorna detalhe completo para id existente', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/children/child-test-001',
      headers: authHeader(),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.id).toBe('child-test-001');
    expect(body).toHaveProperty('health');
    expect(body).toHaveProperty('education');
    expect(body).toHaveProperty('social');
  });

  it('retorna null explícito para áreas sem dados', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/children/child-test-002',
      headers: authHeader(),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.health).toBeNull();
    expect(body.education).toBeNull();
    expect(body.social).toBeNull();
  });

  it('retorna 404 para id inexistente', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/children/id-nao-existe',
      headers: authHeader(),
    });
    expect(res.statusCode).toBe(404);
  });
});

describe('FR-06 — PATCH /children/:id/review', () => {
  it('registra revisão com reviewedAt e reviewedBy', async () => {
    const before = Date.now();
    const res = await app.inject({
      method: 'PATCH',
      url: '/children/child-test-001/review',
      headers: authHeader(),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.id).toBe('child-test-001');
    expect(new Date(body.reviewedAt).getTime()).toBeGreaterThanOrEqual(before);
    expect(body.reviewedBy).toBe('tecnico@prefeitura.rio');
  });

  it('revisão é idempotente (segunda chamada atualiza reviewedAt)', async () => {
    const res1 = await app.inject({
      method: 'PATCH',
      url: '/children/child-test-001/review',
      headers: authHeader(),
    });
    await new Promise((r) => setTimeout(r, 10));
    const res2 = await app.inject({
      method: 'PATCH',
      url: '/children/child-test-001/review',
      headers: authHeader(),
    });
    const t1 = new Date(res1.json().reviewedAt).getTime();
    const t2 = new Date(res2.json().reviewedAt).getTime();
    expect(t2).toBeGreaterThanOrEqual(t1);
  });

  it('retorna 404 para id inexistente', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/children/nao-existe/review',
      headers: authHeader(),
    });
    expect(res.statusCode).toBe(404);
  });
});

describe('FR-05 — GET /summary', () => {
  it('retorna contadores corretos', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/summary',
      headers: authHeader(),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('totalChildren');
    expect(body).toHaveProperty('reviewed');
    expect(body).toHaveProperty('pending');
    expect(body).toHaveProperty('healthAlerts');
    expect(body).toHaveProperty('educationAlerts');
    expect(body).toHaveProperty('socialAlerts');
    expect(body.totalChildren).toBe(body.reviewed + body.pending);
  });
});
