FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ─── Dependencies ─────────────────────────────────────────
FROM base AS deps
RUN echo "RAILWAY BUILD v1.0.1 - npm install"
COPY package.json ./
RUN npm install --no-fund --no-audit

# ─── Build ────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ─── Production ───────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads
USER nestjs

EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main"]
