# Multi-stage Dockerfile
FROM node:20-alpine AS deps
LABEL maintainer="Escrow Marketplace <admin@escrow.io>"
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
RUN corepack enable pnpm && pnpm turbo run build --filter=@em/api

FROM node:20-alpine AS production
LABEL maintainer="Escrow Marketplace <admin@escrow.io>"
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
USER node
COPY --from=build --chown=node:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=node:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=build --chown=node:nodejs /app/apps/api/prisma ./prisma
COPY --from=build --chown=node:nodejs /app/packages/shared ./packages/shared
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/main"]
