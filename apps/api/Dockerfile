### Estágio 1: build — usa node_modules pré-instalados do host (sem acesso à internet)
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY tsconfig.base.json ./

# Copia node_modules pré-instalados (inclui binários Linux gerados pelo prisma generate)
COPY node_modules ./node_modules

COPY apps/api ./apps/api

WORKDIR /app/apps/api
# Compila TypeScript (src/ + prisma/seed.ts → dist/)
RUN node_modules/.bin/tsc -p tsconfig.json

### Estágio 2: imagem final
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# OpenSSL necessário para o Prisma query engine no Alpine
RUN apk add --no-cache openssl

RUN addgroup -g 1001 -S nodejs && adduser -S api -u 1001

# node_modules completo (inclui prod + Prisma client com binários Linux)
COPY --from=build /app/node_modules ./node_modules
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
