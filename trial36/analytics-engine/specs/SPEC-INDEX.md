# Specification Index

## Overview

This document indexes all specifications for the Analytics Engine platform,
a multi-tenant data analytics system built as a Turborepo monorepo. The platform
provides dashboard management, data pipeline orchestration, and report generation
through a secure REST API and modern web interface.

## Specification Files

### [System Architecture](system-architecture.md)

Defines the overall architecture of the Analytics Engine platform including:
- Presentation, Application, Data, and Shared layers
- Deployment strategy with Docker multi-stage builds
- CI/CD pipeline configuration
- VERIFY tags: AE-ARCH-001 through AE-ARCH-005

### [API](api.md)

Documents all REST API endpoints including:
- Authentication endpoints (register, login, me)
- Dashboard CRUD endpoints with pagination
- Pipeline CRUD endpoints with status transitions
- Error response format
- Cross-references: auth.md, security.md
- VERIFY tags: AE-API-001 through AE-API-008

### [Authentication](auth.md)

Covers the authentication and authorization system:
- JWT-based authentication flow
- Password security with bcrypt
- Role-based access control (ADMIN, MANAGER, ANALYST, VIEWER)
- Guards and input sanitization
- Audit logging with masked sensitive data
- VERIFY tags: AE-AUTH-001 through AE-AUTH-010

### [Database](database.md)

Defines the data model and database configuration:
- PostgreSQL 16 with Prisma ^6.0.0 ORM
- 6 models: Tenant, User, Dashboard, Pipeline, PipelineRun, Report
- 3 enums: UserRole, PipelineStatus, ReportStatus
- Snake_case naming convention via @@map/@map
- Row Level Security on all tables
- Seed data with failure states
- VERIFY tags: AE-DB-001 through AE-DB-006

### [Frontend](frontend.md)

Documents the web application structure:
- Next.js ^15.0.0 with App Router and Server Components
- 4 routes with loading and error states
- 8 UI components with cn() utility
- Server Actions with response.ok checks
- Dark mode via CSS prefers-color-scheme
- Accessibility features (ARIA, keyboard navigation)
- VERIFY tags: AE-FE-001 through AE-FE-012, AE-UI-001 through AE-UI-008

### [Infrastructure](infrastructure.md)

Covers deployment and CI/CD configuration:
- 3-stage Dockerfile (deps, build, production)
- Docker Compose for development and testing
- GitHub Actions CI workflow
- Environment variable documentation
- VERIFY tags: AE-INFRA-001 through AE-INFRA-004

### [Testing](testing.md)

Defines the testing strategy and test file structure:
- 3 unit test files for API services
- 2 integration test files with real AppModule
- 1 security test file
- 1 component accessibility test file (jest-axe)
- 1 keyboard navigation test file (userEvent)
- 1 page rendering test file
- VERIFY tags: AE-TEST-001 through AE-TEST-005

### [Security](security.md) (Layer 6 - NEW)

Documents all security controls for the platform:
- Threat model with attack surface analysis
- Helmet.js with Content Security Policy
- Rate limiting with @nestjs/throttler
- CORS configuration with explicit origin
- Input validation with class-validator
- SQL injection prevention via Prisma
- XSS prevention with sanitizeInput()
- Environment variable security
- Audit logging with data masking
- VERIFY tags: AE-SEC-001 through AE-SEC-006

## VERIFY Tag Summary

| Prefix | Count | Specification |
|--------|-------|---------------|
| AE-ARCH | 5 | System Architecture |
| AE-API | 8 | API |
| AE-AUTH | 10 | Authentication |
| AE-DB | 6 | Database |
| AE-FE | 12 | Frontend |
| AE-UI | 8 | Frontend (UI Components) |
| AE-INFRA | 4 | Infrastructure |
| AE-TEST | 5 | Testing |
| AE-SEC | 6 | Security |
| **Total** | **64** | |

## Cross-Reference Map

- api.md references: auth.md, security.md
- system-architecture.md references: frontend.md, api.md, auth.md
- auth.md references: (standalone)
- database.md references: (standalone)
- frontend.md references: (standalone)
- infrastructure.md references: (standalone)
- testing.md references: (standalone)
- security.md references: (standalone)

## Layer History

| Layer | Focus | Key Additions |
|-------|-------|---------------|
| L1 | Foundation | Project structure, Prisma schema, basic API |
| L2 | API | REST endpoints, authentication, pagination |
| L3 | Frontend | Next.js pages, UI components, server actions |
| L4 | Testing | Unit tests, integration tests, accessibility |
| L5 | Infrastructure | Docker, CI/CD, environment configuration |
| L6 | Security | Helmet, rate limiting, CORS, input validation |
