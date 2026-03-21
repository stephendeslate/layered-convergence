# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/
RUN corepack enable pnpm && pnpm install --frozen-lockfile && npx prisma generate

# Stage 2: Build application
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm run build

# Stage 3: Production
FROM node:20-alpine AS production

LABEL maintainer="SJD Labs <dev@sjdlabs.com>"
LABEL version="1.0.0"
LABEL description="Escrow Marketplace — escrow payment platform backend"

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/auth/health || exit 1

CMD ["node", "dist/main"]
