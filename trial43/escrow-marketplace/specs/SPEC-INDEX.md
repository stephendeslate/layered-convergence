# Escrow Marketplace - Specification Index

## Project Overview

The Escrow Marketplace (EM) is a multi-tenant platform enabling secure
buyer-seller transactions with built-in escrow protection and dispute
resolution. Built as a Turborepo 2 monorepo with NestJS 11 API and
Next.js 15 frontend. Trial 43, Layer 9 (Cross-Layer Integration).

## Specification Documents

| Document | Description | Key VERIFY Tags |
|----------|-------------|-----------------|
| [API Contracts](./api-contracts.md) | REST API endpoint definitions | EM-API-*, EM-AUTH-* |
| [Architecture](./architecture.md) | System architecture and module structure | EM-ARCH-*, EM-MOD-* |
| [Authentication](./authentication.md) | Auth flow, JWT, APP_GUARD, @Public() | EM-JWT-*, EM-GUARD-* |
| [Cross-Layer](./cross-layer.md) | L9 middleware ordering, guard/filter chain | EM-GUARD-*, EM-TXLR-* |
| [Data Model](./data-model.md) | Prisma schema and database design | EM-DATA-*, EM-ENUM-* |
| [Monitoring](./monitoring.md) | Logging, health checks, and metrics | EM-MON-*, EM-HLTH-* |
| [Performance](./performance.md) | Response time, pagination, caching | EM-PERF-*, EM-PAGE-* |
| [Security](./security.md) | Helmet, throttling, CORS, validation | EM-SEC-*, EM-VAL-* |

## Domain Entities

- **Tenant**: Multi-tenant isolation boundary
- **User**: Buyers, sellers, and administrators
- **Listing**: Items available for sale
- **Transaction**: Purchase records between buyers and sellers
- **Escrow**: Held funds for transaction security
- **Dispute**: Conflict resolution records

## Technology Stack

- **Backend**: NestJS 11, Prisma 6, PostgreSQL 16
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Monorepo**: Turborepo 2 with pnpm workspaces
- **Shared**: @escrow-marketplace/shared package

## VERIFY Tag Registry

All VERIFY tags use the EM- prefix. Tags are distributed across spec
documents and traced in source files via TRACED comments. See individual
spec documents for complete tag listings.

### Tag Categories

- EM-API-*: API contract verifications
- EM-AUTH-*: Authentication verifications
- EM-DATA-*: Data model verifications
- EM-GUARD-*: Guard chain verifications (L9)
- EM-SEC-*: Security verifications
- EM-MON-*: Monitoring verifications
- EM-PERF-*: Performance verifications
- EM-ARCH-*: Architecture verifications
- EM-TXLR-*: Cross-layer integration verifications (L9)

## Cross-References

- Security spec references API contracts for endpoint protection
- Performance spec references data model for indexing strategy
- Monitoring spec references architecture for middleware pipeline
- Authentication spec references security for rate limiting
- Cross-layer spec documents end-to-end guard/filter/interceptor chain
