# System Architecture Specification

## Overview

The Analytics Engine is a multi-tenant data analytics platform built as a
Turborepo monorepo. It comprises a NestJS API backend, a Next.js frontend,
and a shared utility package.

## Monorepo Structure

The repository uses pnpm workspaces with Turborepo for task orchestration.
Three packages exist: apps/api, apps/web, and packages/shared.

[VERIFY: AE-ARCH-01] The root package.json declares packageManager as pnpm@9.15.4.

[VERIFY: AE-ARCH-02] turbo.json defines build, dev, lint, test, and typecheck tasks.

## Package Boundaries

The shared package (@analytics-engine/shared) exports types, constants, and
utility functions consumed by both apps/api and apps/web. This avoids code
duplication and ensures consistent behavior across the stack.

[VERIFY: AE-ARCH-03] The shared package exports slugify, truncateText,
sanitizeInput, maskSensitive, paginate, isAllowedRegistrationRole,
formatBytes, and generateId.

[VERIFY: AE-ARCH-04] apps/api imports from @analytics-engine/shared in at
least three source files.

[VERIFY: AE-ARCH-05] apps/web imports from @analytics-engine/shared in at
least three source files.

## Build Pipeline

Turborepo caches build outputs. The build task depends on upstream package
builds (^build). The dev task is persistent and not cached.

[VERIFY: AE-ARCH-06] The API uses NestJS ^11.0.0 as its framework.

[VERIFY: AE-ARCH-07] The web app uses Next.js ^15.0.0 with React ^19.0.0.

## Runtime Configuration

All configuration is read from environment variables. The API fails fast
on startup if required variables (DATABASE_URL, JWT_SECRET) are missing.
No hardcoded fallback values are used for secrets.

[VERIFY: AE-ARCH-08] main.ts validates that DATABASE_URL and JWT_SECRET
environment variables are present before starting the server.

## Dependency Management

Dependencies are managed through pnpm workspaces. The shared package is
referenced using `workspace:*` protocol in consuming packages. Turborepo
ensures the shared package is built before dependent packages.

## Development Workflow

Developers run `pnpm install` once at the root, then use turbo commands
for building, testing, and linting. The dev task runs both apps in watch
mode concurrently.
