# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS base

# node-canvas (used by qr-code-styling for server-side logo rendering) needs
# these system libraries at both build time (to compile/link against) and
# runtime (to dlopen). Missing them is a silent multi-second hang, not a
# clean error - see lib/qr-render.ts.
FROM base AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential pkg-config python3 openssl \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, not
# read at container start - they must be passed as build args (see
# docker-compose.yml / Dokploy's build-time env var settings), not just
# runtime environment.
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_REDIRECT_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_REDIRECT_BASE_URL=${NEXT_PUBLIC_REDIRECT_BASE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libjpeg62-turbo libgif7 librsvg2-2 openssl \
    postgresql gosu \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
# Prisma 7 reads the datasource URL from this config file (not inline in
# schema.prisma), so `prisma migrate deploy` at container start needs it.
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json
# Not needed by the Next.js server itself (bundled into .next/standalone),
# but prisma/seed.ts imports it directly and is run ad hoc via
# `docker exec ... npx tsx prisma/seed.ts` (see README), not from a route.
COPY --from=builder /app/app/generated ./app/generated
# Standalone's file tracing can miss native addons (sharp, canvas) since
# they resolve platform binaries at runtime rather than via static requires.
# Overlaying the full node_modules from the deps stage guarantees they and
# the Prisma query engine are actually present, at the cost of image size.
COPY --from=deps /app/node_modules ./node_modules
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p /app/public/uploads/logos /var/lib/postgresql/data /run/postgresql \
  && chown -R nextjs:nodejs /app \
  && chown -R postgres:postgres /var/lib/postgresql /run/postgresql \
  && chmod +x /app/docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PGDATA=/var/lib/postgresql/data
ENV POSTGRES_USER=pciqr
ENV POSTGRES_DB=pci_qr
ENV POSTGRES_PORT=5432

ENTRYPOINT ["/app/docker-entrypoint.sh"]
