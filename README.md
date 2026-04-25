# Painel de Vigilância Social — Prefeitura do Rio

Desafio Técnico Full-stack Pleno · Autor: AkiraGi · Versão 1.0

## Como Rodar

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose (opcional, para produção)

### Desenvolvimento local

```bash
# 1. Clone e instale dependências
git clone <repo>
cd painel-vigilancia-social
npm install
cd apps/api && npm install && cd ../web && npm install && cd ../..

# 2. Configure variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Suba o banco e rode o seed
cd apps/api
npx prisma migrate deploy
npx tsx prisma/seed.ts
cd ../..

# 4. Inicie os servidores em paralelo
npx concurrently "npm run dev --workspace=apps/api" "npm run dev --workspace=apps/web"
```

Acesse:
- Frontend: http://localhost:3000
- API: http://localhost:3001

### Docker Compose (produção)

```bash
docker compose up --build
```

Acesse http://localhost:3000

## Credenciais de Teste

| Campo | Valor |
|-------|-------|
| E-mail | `tecnico@prefeitura.rio` |
| Senha | `painel@2024` |

## Rodando os Testes

```bash
# Testes de integração da API (18 testes)
cd apps/api
npm test

# Build de verificação do frontend
cd apps/web
npm run build
```

## Decisões Arquiteturais

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Backend | Node.js 20 + Fastify + TypeScript | Fastify tem validação nativa via JSON Schema, melhor throughput que Express |
| Banco | SQLite via Prisma | Zero configuração no Docker, migração simples para Postgres (troca a datasource) |
| Auth | JWT (jose) | Simples, sem estado, payload com `preferred_username` conforme spec |
| Frontend | Next.js 14 App Router | App Router permite server components para páginas estáticas, client para interação |
| Estilização | Tailwind CSS + componentes shadcn-style | Produtividade + consistência visual + acessibilidade WCAG AA |
| Estado servidor | TanStack Query | Cache, invalidação e estados loading/erro declarativos |
| Forms | react-hook-form + zod | Validação type-safe compartilhada com o backend |
| Testes | Vitest + Fastify inject | Rápido, nativo TS, testa contratos HTTP sem servidor externo |

## Trade-offs Principais

**SQLite vs Postgres:** SQLite dispensa serviço extra no Compose e zera fricção para o avaliador. Migrar para Postgres é trocar a `datasource` do Prisma e rodar `migrate deploy` — documentado abaixo.

**App Router vs Pages Router:** App Router é o padrão atual do Next.js 14. Server Components reduzem JS no cliente, importante para o celular de baixo custo do técnico de campo.

**shadcn-style manual vs biblioteca:** Copiei os componentes para dentro do projeto seguindo o padrão shadcn/ui, sem dependência pesada. Fácil de customizar, acessível por padrão (Radix UI).

**AuthGuard client-side:** Para o escopo do desafio, a proteção de rota por `localStorage` no lado cliente é suficiente e evita complexidade de middleware Next.js ou cookies HttpOnly. Em produção, migraria para cookies com `httpOnly` + middleware.

## Migrar SQLite → Postgres

```prisma
// apps/api/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db" npx prisma migrate deploy
```

## Com Mais Tempo Faria

- **Auditoria completa:** tabela de `events` com histórico de toda revisão (quem mudou o quê e quando)
- **Filtro textual por nome** com índice FTS no SQLite/Postgres
- **Mapa de calor por bairro** com Leaflet + geocoding dos endereços
- **Testes E2E Playwright** cobrindo os 3 fluxos principais (login, filtrar+revisar, expiração de token)
- **OpenAPI automático** gerado pelo Fastify a partir dos JSON Schemas
- **Rate limit** mais granular com Redis em vez de memória
- **Dark mode** com `next-themes`
- **Internacionalização** pt-BR primeiro, preparado para outros idiomas
- **Notificações push** quando uma criança passa para status crítico

## Estrutura do Projeto

```
painel-vigilancia-social/
├── apps/
│   ├── api/                          # Fastify + Prisma
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # POST /auth/token
│   │   │   │   ├── children/         # GET/PATCH /children
│   │   │   │   └── summary/          # GET /summary
│   │   │   ├── plugins/              # jwt, prisma, error-handler
│   │   │   └── server.ts
│   │   └── prisma/
│   │       ├── schema.prisma         # Child, HealthRecord, EducationRecord, SocialRecord
│   │       └── seed.ts               # 25 crianças + 1 técnico
│   └── web/                          # Next.js 14 App Router
│       └── src/
│           ├── app/                  # /login, /dashboard, /children/[id]
│           ├── components/
│           │   ├── ui/               # Button, Card, Badge, Input, Toaster
│           │   └── features/         # SummaryCards, ChildList, ChildCard, AuthGuard, Navbar
│           ├── hooks/                # use-toast
│           └── lib/                  # api.ts (client HTTP), utils.ts
├── docker-compose.yml
└── README.md
```
