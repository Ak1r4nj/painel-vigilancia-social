### Estágio 1: dependências de produção
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci --workspace=apps/web --omit=dev

### Estágio 2: build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci --workspace=apps/web

COPY apps/web ./apps/web

WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

### Estágio 3: runner
# Em monorepo, Next.js standalone gera server.js em apps/web/ dentro do diretório standalone
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copia o standalone completo (inclui apps/web/server.js + node_modules embutidos)
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# Arquivos estáticos e public
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# server.js fica em apps/web/ dentro do standalone
CMD ["node", "apps/web/server.js"]
