# ---------- BASE ----------
FROM node:22-slim AS base
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates openssl tzdata \
 && rm -rf /var/lib/apt/lists/*

# ---------- DEPS (dev) ----------
FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

# ---------- BUILD ----------
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig*.json nest-cli.json ./
COPY common ./common
COPY utils ./utils
COPY src ./src
RUN npm run build

# ---------- PROD DEPS ----------
FROM node:22-slim AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- RUNNER ----------
FROM node:22-slim AS runner
WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules

COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Собранное приложение и схема
COPY --from=build /app/dist ./dist
COPY prisma ./prisma

# entrypoint
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]