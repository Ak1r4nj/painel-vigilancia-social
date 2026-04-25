### Estágio 1: dependências de produção
FROM node:20-alpine AS deps
WORKDIR /app
# Copia manifests do workspace raiz + api
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
# npm workspaces hoista tudo para root/node_modules
RUN npm ci --workspace=apps/api --omit=dev

### Estágio 2: build (instala root + api para ter tsc, tsx e demais devDeps)
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
# Instala TUDO da raiz (inclui typescript do root devDeps)
RUN npm ci --workspace=apps/api --include-workspace-root

COPY apps/api ./apps/api
COPY tsconfig.base.json ./

WORKDIR /app/apps/api
# Gera o Prisma Client (vai para /app/node_modules/.prisma)
RUN npx prisma generate
# Compila TypeScript (src/ + prisma/seed.ts → dist/)
RUN npm run build

### Estágio 3: imagem final
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# OpenSSL necessário para o Prisma query engine no Alpine
RUN apk add --no-cache openssl

RUN addgroup -g 1001 -S nodejs && adduser -S api -u 1001

# Dependências de produção (hoistadas pelo npm workspaces)
COPY --from=deps /app/node_modules ./node_modules
# Prisma Client gerado (não existe nos deps, só após generate no build)
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
# Código compilado
COPY --from=build /app/apps/api/dist ./dist
# Schema + migrations (necessários para prisma migrate deploy)
COPY apps/api/prisma ./prisma
# Entrypoint
COPY apps/api/entrypoint.sh ./entrypoint.sh

# Cria /data com permissão para o usuário api
RUN mkdir -p /data && chown -R api:nodejs /data
RUN chmod +x /app/entrypoint.sh && chown -R api:nodejs /app
USER api

EXPOSE 3001
ENTRYPOINT ["/app/entrypoint.sh"]
