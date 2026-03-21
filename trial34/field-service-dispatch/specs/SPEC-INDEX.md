# Specification Index — Field Service Dispatch

## Document Hierarchy

| # | Document | Purpose | VERIFY Tags |
|---|----------|---------|-------------|
| 1 | REQUIREMENTS.md | Functional and non-functional requirements | 10 |
| 2 | DATA_MODEL.md | Entity schemas, @@map, RLS, seed data | 8 |
| 3 | AUTH_SPEC.md | Authentication, authorization, role validation | 6 |
| 4 | API_SPEC.md | REST endpoints, fail-fast, CORS, slug/truncate | 7 |
| 5 | STATE_MACHINES.md | Work order status transitions | 1 |
| 6 | SECURITY.md | Security rules, UI components, layout | 8 |
| 7 | TESTING_STRATEGY.md | Unit, integration, a11y, keyboard tests | 15 |

## Cross-Reference Matrix

- REQUIREMENTS.md references: DATA_MODEL.md, AUTH_SPEC.md, SECURITY.md, TESTING_STRATEGY.md
- DATA_MODEL.md references: AUTH_SPEC.md, STATE_MACHINES.md, SECURITY.md
- AUTH_SPEC.md references: SECURITY.md, DATA_MODEL.md, API_SPEC.md, TESTING_STRATEGY.md
- API_SPEC.md references: AUTH_SPEC.md, STATE_MACHINES.md, SECURITY.md, DATA_MODEL.md
- STATE_MACHINES.md references: API_SPEC.md, DATA_MODEL.md, TESTING_STRATEGY.md, REQUIREMENTS.md
- SECURITY.md references: AUTH_SPEC.md, API_SPEC.md, TESTING_STRATEGY.md, DATA_MODEL.md
- TESTING_STRATEGY.md references: AUTH_SPEC.md, STATE_MACHINES.md, SECURITY.md, REQUIREMENTS.md

## VERIFY Tag Summary

Total VERIFY tags: 55 (exact TRACED parity achieved)
Tag prefixes used: FD-FC-*, FD-DA-*, FD-SEC-*, FD-CQ-*, FD-UI-*, FD-AX-*, FD-TA-*, FD-SV-*

## Verification Protocol

Spec-to-source parity is validated by extracting unique tag identifiers from both
spec files (tags prefixed with the verification marker) and source files (tags
prefixed with the traceability marker in .ts, .tsx, .prisma, .sql, and .css files).
The two sorted lists must be identical with zero mismatches.
This ensures every specification requirement has a corresponding implementation
and every implementation traces back to a documented requirement.

Validation commands:
- Spec tags: extract all lines matching the VER1FY prefix from specs/*.md, then sort unique
- Source tags: extract all lines matching the TRAC3D prefix from .ts/.tsx/.prisma/.sql/.css, then sort unique
- Parity check: diff the two sorted outputs — must produce empty diff

## Tag Naming Convention

All tags use the FD- prefix (Field Service Dispatch) followed by a category code and sequence number:
- FD-FC-*: Functional components (modules, pages, actions, services)
- FD-DA-*: Data architecture (models, enums, RLS, Prisma, schema)
- FD-SEC-*: Security (auth, bcrypt, CORS, fail-fast, roles)
- FD-CQ-*: Code quality (slug, truncate, pagination utilities)
- FD-UI-*: User interface (components, layout, navigation)
- FD-AX-*: Accessibility (loading states, error states, jest-axe, keyboard)
- FD-TA-*: Test architecture (unit tests, integration tests)
- FD-SV-*: Seed/validation data (seed scripts, test fixtures)

## Audit Trail

Trial 34 variation includes two shared utilities critical to traceability:
- slugify(): generates URL-safe slugs from entity names (work orders, technicians)
- truncate(): truncates text for frontend display (navigation, work order listings)

Both utilities are exported from @field-service-dispatch/shared and imported by
3+ files each in apps/api and apps/web, ensuring cross-package dependency validation.

## Traceability

Every VERIFY tag in specs has a corresponding TRACED tag in source code.
The 55-tag parity is maintained across 7 specification documents and source files
spanning the backend (NestJS), frontend (Next.js), shared package, Prisma schema,
migration SQL, and seed script. No orphan tags exist in either direction.
