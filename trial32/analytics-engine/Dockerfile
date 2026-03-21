# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

RUN pnpm turbo run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=build --chown=appuser:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=appuser:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=build --chown=appuser:nodejs /app/apps/api/prisma ./prisma
COPY --from=build --chown=appuser:nodejs /app/apps/api/package.json ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

LABEL org.opencontainers.image.title="Analytics Engine API"
LABEL org.opencontainers.image.description="Multi-tenant analytics platform backend"
LABEL org.opencontainers.image.version="1.0.0"

CMD ["node", "dist/main.js"]
