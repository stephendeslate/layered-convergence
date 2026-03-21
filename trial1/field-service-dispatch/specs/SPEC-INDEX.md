# SPEC-INDEX — Specification Suite Index

**Project:** Field Service Dispatch
**Version:** 1.0
**Date:** 2026-03-20

---

## 1. Document Inventory

| § Reference | Document | File | Lines | Status |
|-------------|----------|------|-------|--------|
| §PVD | Product Vision Document | `specs/PVD.md` | ~250 | Draft |
| §BRD | Business Requirements Document | `specs/BRD.md` | ~330 | Draft |
| §PRD | Product Requirements Document | `specs/PRD.md` | ~370 | Draft |
| §SRS-1 | Architecture | `specs/SRS-1.md` | ~450 | Draft |
| §SRS-2 | Data Model | `specs/SRS-2.md` | ~950 | Draft |
| §SRS-3 | Domain Logic | `specs/SRS-3.md` | ~1000 | Draft |
| §SRS-4 | Communications & Security | `specs/SRS-4.md` | ~950 | Draft |
| §WIREFRAMES | UI Wireframes | `specs/WIREFRAMES.md` | ~770 | Draft |
| §SPEC-INDEX | This document | `specs/SPEC-INDEX.md` | ~59 | Draft |

## 2. Recommended Reading Order

1. **§PVD** — Start here. Understand the problem, personas, and vision.
2. **§BRD** — Business rules and constraints that govern the system.
3. **§PRD** — What the system does (functional requirements).
4. **§WIREFRAMES** — How the system looks (UI specifications).
5. **§SRS-1** — How the system is built (architecture, deployment).
6. **§SRS-2** — Data model, schema, RLS policies, API endpoints.
7. **§SRS-3** — State machine, algorithms, protocols, background jobs.
8. **§SRS-4** — Auth, security, notifications, audit, compliance.

## 3. Cross-Reference Map

| Source | References |
|--------|-----------|
| §PVD | §BRD, §PRD, §SRS-1, §SRS-2, §SRS-3, §SRS-4, §WIREFRAMES |
| §BRD | §PVD (personas), §PRD, §SRS-1, §SRS-2, §SRS-3, §SRS-4, §WIREFRAMES |
| §PRD | §PVD (personas), §BRD (BR-*), §SRS-1, §SRS-2, §SRS-3, §SRS-4, §WIREFRAMES |
| §SRS-1 | §BRD, §PRD, §SRS-2, §SRS-3, §SRS-4, §WIREFRAMES |
| §SRS-2 | §BRD (BR-100, BR-101), §SRS-1, §SRS-3, §SRS-4 |
| §SRS-3 | §BRD (BR-200–BR-403), §PRD (FR-*), §SRS-1, §SRS-2, §SRS-4, §WIREFRAMES |
| §SRS-4 | §BRD (BR-800–BR-802), §PRD (FR-900–FR-902), §SRS-1, §SRS-2, §SRS-3, §WIREFRAMES |
| §WIREFRAMES | §PRD, §BRD (BR-400, BR-401), §SRS-1, §SRS-3 |

## 4. Key Identifiers

| Prefix | Meaning | Defined In |
|--------|---------|-----------|
| BR-* | Business Requirement | §BRD |
| FR-* | Functional Requirement | §PRD |
| NFR-* | Non-Functional Requirement | §SRS-1, §PRD |
| T1-T17 | Work Order State Transitions | §SRS-3 |
| WO-* | Work Order Reference Number | §SRS-2 |
| INV-* | Invoice Reference Number | §SRS-2 |

## 5. External Dependencies Summary

| Dependency | Referenced In |
|-----------|--------------|
| OpenRouteService (Directions + Optimization) | §BRD, §SRS-1, §SRS-3 |
| OpenStreetMap + Leaflet | §BRD, §SRS-1, §WIREFRAMES |
| Stripe (Invoicing + Payments) | §BRD, §SRS-2, §SRS-3, §SRS-4 |
| PostgreSQL + PostGIS | §SRS-1, §SRS-2 |
| Redis + BullMQ | §SRS-1, §SRS-3 |
| Socket.io (WebSocket) | §SRS-1, §SRS-3, §SRS-4 |
| Twilio (SMS) | §SRS-4 |
| Resend (Email) | §SRS-4 |

---

*End of Specification Index*
