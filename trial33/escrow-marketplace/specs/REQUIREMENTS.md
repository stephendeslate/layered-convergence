# Escrow Marketplace — Requirements Specification

## Overview

Escrow Marketplace is a multi-tenant secure escrow payment platform supporting
transaction lifecycle management, dispute resolution, role-based access, and
audit logging. See DATA_MODEL.md for entity definitions and API_SPEC.md for endpoints.

## Functional Requirements

### FR-1: Multi-Tenancy
- VERIFY: EM-REQ-MT-001 — Each tenant has isolated data via Row Level Security
- VERIFY: EM-REQ-MT-002 — Users belong to exactly one tenant
- Tenant context is set per-request using Prisma.sql parameterized queries
- Cross-references: DATA_MODEL.md (Tenant entity), SECURITY.md (RLS policies)

### FR-2: Escrow Transaction Management
- VERIFY: EM-REQ-ESC-001 — Buyers and sellers can create escrow transactions
- VERIFY: EM-REQ-ESC-002 — Transactions follow a defined state machine lifecycle
- VERIFY: EM-REQ-ESC-003 — Monetary amounts stored as Decimal(12,2)
- Pagination uses the shared paginate<T>() utility from @escrow-marketplace/shared
- Cross-references: API_SPEC.md (escrow endpoints), STATE_MACHINES.md (EscrowStatus)

### FR-3: Dispute Resolution
- VERIFY: EM-REQ-DISP-001 — Buyers or sellers can file disputes on transactions
- VERIFY: EM-REQ-DISP-002 — Disputes follow a defined state machine lifecycle
- VERIFY: EM-REQ-DISP-003 — Arbiters can be assigned to disputes
- Cross-references: STATE_MACHINES.md (DisputeStatus), DATA_MODEL.md (Dispute)

### FR-4: Role Management
- VERIFY: EM-REQ-ROLE-001 — Four roles: ADMIN, BUYER, SELLER, ARBITER
- ADMIN role cannot be self-registered
- Cross-references: AUTH_SPEC.md (role restrictions)

### FR-5: Audit Logging
- VERIFY: EM-REQ-AUD-001 — All entity mutations are logged with metadata
- Audit logs are immutable (no update/delete operations)
- Cross-references: DATA_MODEL.md (AuditLog), SECURITY.md (audit controls)

## Non-Functional Requirements

### NFR-1: Security
- JWT-based authentication with 24-hour token expiry
- bcrypt password hashing with salt rounds of 12
- No hardcoded secrets — environment variables required
- Cross-references: AUTH_SPEC.md, SECURITY.md

### NFR-2: Performance
- Paginated list endpoints with configurable page size (max 100)
- Database indexes on foreign keys and unique constraints

### NFR-3: Accessibility
- All UI components pass jest-axe accessibility checks
- Keyboard navigation supported for all interactive elements
- Loading states use role="status" with aria-busy
- Error states use role="alert" with focus management
- Cross-references: TESTING_STRATEGY.md (accessibility tests)

### NFR-4: Deployment
- Multi-stage Docker build with node:20-alpine
- CI/CD via GitHub Actions with PostgreSQL service container
- Turborepo for coordinated builds across workspace packages
- Cross-references: SECURITY.md (container security)
