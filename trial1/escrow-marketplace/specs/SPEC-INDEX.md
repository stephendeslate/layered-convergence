# Specification Index (SPEC-INDEX)

## Escrow Marketplace — Conditional Payment Platform

| Field            | Value                          |
|------------------|--------------------------------|
| Version          | 1.0                            |
| Date             | 2026-03-20                     |

---

## 1. Document Registry

| § Reference  | File             | Title                              | Lines | Status |
|--------------|------------------|------------------------------------|-------|--------|
| §PVD         | `PVD.md`         | Product Vision Document            | ~230  | Draft  |
| §BRD         | `BRD.md`         | Business Requirements Document     | ~300  | Draft  |
| §PRD         | `PRD.md`         | Product Requirements Document      | ~310  | Draft  |
| §SRS-1       | `SRS-1.md`       | Architecture Specification         | ~400  | Draft  |
| §SRS-2       | `SRS-2.md`       | Data Model Specification           | ~860  | Draft  |
| §SRS-3       | `SRS-3.md`       | Domain Logic Specification         | ~870  | Draft  |
| §SRS-4       | `SRS-4.md`       | Communications & Security Spec     | ~820  | Draft  |
| §WIREFRAMES  | `WIREFRAMES.md`  | Wireframes & UI Specification      | ~770  | Draft  |
| §SPEC-INDEX  | `SPEC-INDEX.md`  | This document                      | ~60   | Draft  |

---

## 2. Reading Order

| Phase              | Documents                       | Purpose                           |
|--------------------|---------------------------------|-----------------------------------|
| 1. Vision          | §PVD                           | Problem, personas, success metrics|
| 2. Business Rules  | §BRD                           | Testable business rules, compliance|
| 3. Requirements    | §PRD                           | Functional requirements, user stories|
| 4. Architecture    | §SRS-1                         | Tech stack, deployment, CI/CD     |
| 5. Data Model      | §SRS-2                         | Schema, enums, RLS, API endpoints |
| 6. Domain Logic    | §SRS-3                         | State machine, algorithms, webhooks|
| 7. Security        | §SRS-4                         | Auth, emails, audit, OWASP       |
| 8. UI Design       | §WIREFRAMES                    | Page layouts, responsive design   |

---

## 3. Cross-Reference Map

| Source     | References                                              |
|------------|---------------------------------------------------------|
| §PVD       | §BRD, §PRD, §SRS-1, §SRS-2, §SRS-3, §SRS-4, §WIREFRAMES |
| §BRD       | §PVD, §PRD, §SRS-1, §SRS-2, §SRS-3, §SRS-4            |
| §PRD       | §PVD, §BRD, §SRS-1, §SRS-2, §SRS-3, §SRS-4, §WIREFRAMES |
| §SRS-1     | §PVD, §BRD, §PRD, §SRS-2, §SRS-3, §SRS-4              |
| §SRS-2     | §BRD, §PRD, §SRS-1, §SRS-3, §SRS-4                    |
| §SRS-3     | §BRD, §PRD, §SRS-1, §SRS-2, §SRS-4                    |
| §SRS-4     | §BRD, §PRD, §SRS-1, §SRS-2, §SRS-3                    |
| §WIREFRAMES| §PVD, §PRD, §SRS-2, §SRS-3, §SRS-4                    |

---

## 4. Key Entity Cross-References

| Entity                    | Defined In | Used In                          |
|---------------------------|------------|----------------------------------|
| User                      | §SRS-2 3.1 | §PRD 2.1, §SRS-3 2, §SRS-4 2   |
| Transaction               | §SRS-2 3.3 | §PRD 2.3-2.6, §SRS-3 1-4       |
| TransactionStateHistory   | §SRS-2 3.4 | §SRS-3 1.5, §SRS-4 4           |
| Dispute                   | §SRS-2 3.5 | §PRD 2.7, §SRS-3 5             |
| DisputeEvidence            | §SRS-2 3.6 | §PRD 2.7, §SRS-3 5.2           |
| StripeConnectedAccount    | §SRS-2 3.2 | §PRD 2.2, §SRS-3 6             |
| Payout                    | §SRS-2 3.7 | §PRD 2.8, §SRS-3 7             |
| WebhookLog                | §SRS-2 3.8 | §SRS-3 7-8                      |

---

*End of SPEC-INDEX — Escrow Marketplace v1.0*
