# Analytics Engine — Specification Index

## Overview

This document serves as the master index for all Analytics Engine (AE) project specifications.
The Analytics Engine is a multi-tenant analytics platform for tracking events, managing data
sources, building dashboards, and orchestrating data pipelines.

## Project Structure

The project follows a Turborepo monorepo layout:
- `apps/api/` — NestJS 11 backend with Prisma 6 and PostgreSQL 16
- `apps/web/` — Next.js 15 frontend with React 19, Tailwind CSS 4, and shadcn/ui
- `packages/shared/` — Pure TypeScript shared utilities

## Specification Documents

| # | Document | Description |
|---|----------|-------------|
| 1 | [architecture.md](./architecture.md) | System architecture, module layout, and dependency graph |
| 2 | [data-model.md](./data-model.md) | Prisma schema, entities, enums, and relationships |
| 3 | [api-contracts.md](./api-contracts.md) | REST API endpoints, DTOs, and response formats |
| 4 | [authentication.md](./authentication.md) | JWT auth, bcrypt hashing, role-based access |
| 5 | [security.md](./security.md) | Helmet CSP, throttling, CORS, input validation, RLS |
| 6 | [performance.md](./performance.md) | Response timing, pagination, caching, query optimization |
| 7 | [monitoring.md](./monitoring.md) | Structured logging, correlation IDs, health checks, metrics |

## VERIFY Tag Registry

All VERIFY tags in this project use the `AE-` prefix.
Tags are distributed across the specification documents above.
Each VERIFY tag has a corresponding TRACED tag in a `.ts` or `.tsx` source file.

## Cross-Reference Policy

Specifications cross-reference each other where concerns overlap:
- security.md references authentication.md for auth flow details
- performance.md references monitoring.md for response time instrumentation
- monitoring.md references architecture.md for module structure
- api-contracts.md references data-model.md for entity definitions
- architecture.md references security.md for guard registration

## Traceability

Every VERIFY tag in any spec MUST have a corresponding TRACED tag in source code.
Every TRACED tag in source code MUST have a corresponding VERIFY tag in a spec.
TRACED tags are ONLY placed in `.ts` and `.tsx` files.

## Layer Coverage

This project implements all cumulative layers of the Layered Convergence methodology:

| Layer | Name | Key Requirements |
|-------|------|------------------|
| 0-2 | Foundation | NestJS 11, Next.js 15, Prisma 6, shadcn/ui, accessibility |
| 3 | Specifications | 7 spec docs, VERIFY/TRACED parity, cross-references |
| 4 | Infrastructure | Dockerfile, CI/CD, migrations, seed, docker-compose |
| 5 | Monorepo | Turborepo 2, pnpm workspaces, shared package |
| 6 | Security | Helmet CSP, throttling, CORS, input validation, RLS |
| 7 | Performance | Response timing, pagination, caching, query optimization |
| 8 | Monitoring | Pino logging, correlation IDs, health checks, metrics |

## T41 Variation

Trial 41 adds RequestContextService — a request-scoped NestJS provider storing
correlation ID, user ID, and tenant ID. The GlobalExceptionFilter and request
logging middleware read from this service instead of parsing headers directly.

## Versioning

- Methodology: v21.0-L8 (Layer 8 — Monitoring, Trial 41)
- Project version: 0.1.0
- Last updated: 2026-03-21
