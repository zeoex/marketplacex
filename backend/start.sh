#!/bin/sh
set -e

echo "=== MarketPlaceX Backend ==="

echo "Ejecutando migraciones de base de datos..."
npx prisma db push --skip-generate --accept-data-loss

echo "Verificando estado de la base de datos..."
CATEGORY_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.category.count()
  .then(function(n) { process.stdout.write(String(n)); })
  .catch(function() { process.stdout.write('0'); })
  .finally(function() { p.\$disconnect(); });
")

if [ "$CATEGORY_COUNT" = "0" ]; then
  echo "Base de datos vacía, cargando datos iniciales..."
  npx ts-node -r tsconfig-paths/register prisma/seed.ts
else
  echo "Base de datos lista (${CATEGORY_COUNT} categorias)"
fi

echo "Iniciando servidor en puerto ${PORT:-3001}..."
exec node dist/main
