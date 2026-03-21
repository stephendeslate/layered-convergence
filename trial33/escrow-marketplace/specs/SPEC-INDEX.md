# Escrow Marketplace — Specification Index

## Document Hierarchy

| # | Document | Purpose | Cross-References |
|---|----------|---------|------------------|
| 1 | REQUIREMENTS.md | Business requirements and user stories | DATA_MODEL, API_SPEC |
| 2 | DATA_MODEL.md | Entity definitions, relationships, constraints | REQUIREMENTS, STATE_MACHINES |
| 3 | API_SPEC.md | REST endpoint specifications | DATA_MODEL, AUTH_SPEC |
| 4 | AUTH_SPEC.md | Authentication and authorization rules | API_SPEC, SECURITY |
| 5 | STATE_MACHINES.md | State transition definitions and rules | DATA_MODEL, API_SPEC |
| 6 | TESTING_STRATEGY.md | Test plan, coverage requirements | API_SPEC, AUTH_SPEC |
| 7 | SECURITY.md | Security controls and threat mitigations | AUTH_SPEC, DATA_MODEL |

## VERIFY Tag Prefix

All VERIFY tags in this project use the **EM-** prefix.

## Traceability

Every VERIFY tag in spec documents must have a matching TRACED tag in source code.
Every TRACED tag in source code must trace back to a VERIFY tag in specs.
Zero orphans are permitted in either direction.

## Document Standards

- All spec files must be >= 50 lines (target 60-80)
- Cross-references between specs are required
- VERIFY tags must be unique within the project
- Tags follow format: EM-{DOMAIN}-{AREA}-{SEQ}

## Version

- **Project**: Escrow Marketplace
- **Methodology**: Layered Convergence v16.1-L5
- **Trial**: 33
- **Layer**: 5 (Monorepo)

## Summary Counts

- Total entities: 5
- State machines: 2 (EscrowStatus, DisputeStatus)
- API endpoints: auth (2), escrow (3), disputes (2)
- VERIFY tags: 67+ across all documents
- Backend unit test files: 3
- Integration test files: 1
- Frontend test files: 2 (accessibility, keyboard)

## Reading Order

For new contributors, the recommended reading order is:
1. REQUIREMENTS.md — understand the business context
2. DATA_MODEL.md — learn the entity structure
3. STATE_MACHINES.md — understand escrow and dispute lifecycles
4. API_SPEC.md — review available endpoints
5. AUTH_SPEC.md — understand authentication and authorization
6. SECURITY.md — review security controls and RLS
7. TESTING_STRATEGY.md — understand test coverage expectations
