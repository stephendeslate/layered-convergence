# Analytics Engine — Security Specification

## Overview

Security controls and threat mitigations for the Analytics Engine platform.
See AUTH_SPEC.md for authentication details and DATA_MODEL.md for database
schema security features.

## Row Level Security (RLS)

- VERIFY: AE-SEC-RLS-001 — All tables have ENABLE ROW LEVEL SECURITY
- VERIFY: AE-SEC-RLS-002 — All tables have FORCE ROW LEVEL SECURITY
- VERIFY: AE-SEC-RLS-003 — Tenant context set via Prisma.sql parameterized query
- RLS policies filter rows by tenant_id matching the session context
- PrismaService.setTenantContext() uses $executeRaw (never $executeRawUnsafe)
- Cross-references: DATA_MODEL.md (tenant_id columns), AUTH_SPEC.md (tenant isolation)

## Secret Management

- VERIFY: AE-SEC-SECRET-001 — JWT_SECRET loaded from environment variable
- VERIFY: AE-SEC-SECRET-002 — No hardcoded secret fallbacks in application code
- VERIFY: AE-SEC-SECRET-003 — CORS_ORIGIN loaded from environment variable
- Application throws Error on startup if required secrets are missing
- .env.example documents all required variables without real values
- Cross-references: AUTH_SPEC.md (fail-fast behavior)

## Input Validation

- VERIFY: AE-SEC-INPUT-001 — All DTOs use class-validator decorators
- VERIFY: AE-SEC-INPUT-002 — ValidationPipe with whitelist: true strips extra fields
- @IsEmail, @IsString, @MinLength, @IsIn used on registration DTO
- Request payloads are validated before reaching service layer
- Cross-references: API_SPEC.md (request bodies), AUTH_SPEC.md (registration)

## Code Quality Controls

- VERIFY: AE-SEC-QUAL-001 — Zero `as any` type assertions in codebase
- VERIFY: AE-SEC-QUAL-002 — Zero `console.log` statements in production code
- VERIFY: AE-SEC-QUAL-003 — Zero `$executeRawUnsafe` usage
- TypeScript strict mode enabled for type safety
- Cross-references: TESTING_STRATEGY.md (code quality tests)

## Container Security

- VERIFY: AE-SEC-DOCKER-001 — Multi-stage build minimizes attack surface
- node:20-alpine base image for minimal footprint
- Non-root user (USER node) for runtime container
- HEALTHCHECK configured for orchestrator integration
- .dockerignore prevents sensitive files from entering image
- Cross-references: REQUIREMENTS.md (NFR-4)

## CORS Configuration

- CORS origin configured from CORS_ORIGIN environment variable
- Only the configured origin can make cross-origin requests
- No wildcard (*) CORS allowed in production
- Cross-references: AUTH_SPEC.md (fail-fast behavior)

## Audit Trail

- VERIFY: AE-SEC-AUDIT-001 — All mutations logged to audit_logs table
- Audit logs capture: tenantId, userId, action, entity, entityId, metadata
- Audit log table is append-only (no UPDATE or DELETE operations)
- Cross-references: DATA_MODEL.md (AuditLog entity), REQUIREMENTS.md (FR-6)
