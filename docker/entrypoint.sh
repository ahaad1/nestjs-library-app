#!/usr/bin/env bash
set -e

echo "Waiting DB… ${DATABASE_URL}"
sleep 3

echo "Prisma migrate deploy…"
npx prisma migrate deploy

echo "Start app"
MAIN=""
if [ -f "dist/main.js" ]; then
  MAIN="dist/main.js"
elif [ -f "dist/src/main.js" ]; then
  MAIN="dist/src/main.js"
else
  echo "❌ Build output not found. Directory structure:"
  ls -la
  echo "dist tree:"
  ls -la dist || true
  exit 1
fi

echo "Using entry: ${MAIN}"
node "${MAIN}"