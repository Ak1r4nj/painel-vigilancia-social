#!/bin/sh
set -e

echo "→ Rodando migrations..."
node_modules/.bin/prisma migrate deploy --schema=/app/prisma/schema.prisma

echo "→ Rodando seed..."
node /app/dist/prisma/seed.js

echo "→ Iniciando API..."
exec node /app/dist/src/server.js
