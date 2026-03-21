# Specification Index
# Marketplace Payment Hold & Conditional Release Platform

**Version:** 1.0
**Date:** 2026-03-20

---

## Spec Documents

| Document | File | Description | ~Lines |
|----------|------|-------------|--------|
| Product Vision | [PVD.md](./PVD.md) | Problem statement, target users, value proposition, competitive analysis | 280 |
| Business Requirements | [BRD.md](./BRD.md) | Payment flow requirements, compliance, fee structure, dispute SLAs | 330 |
| Product Requirements | [PRD.md](./PRD.md) | User stories for buyers, providers, admins; acceptance criteria | 360 |
| System Architecture | [SRS-1.md](./SRS-1.md) | Service boundaries, Stripe Connect architecture, webhook design, queues | 420 |
| Database Schema & API | [SRS-2.md](./SRS-2.md) | Prisma schema, RLS policies, REST endpoint specifications | 900 |
| Business Logic | [SRS-3.md](./SRS-3.md) | State machine, dispute workflow, auto-release, fee calculation, webhooks | 1000 |
| Security & Compliance | [SRS-4.md](./SRS-4.md) | RLS, webhook signatures, rate limiting, CORS, PCI approach | 850 |
| Wireframes | [WIREFRAMES.md](./WIREFRAMES.md) | ASCII wireframes for all portals and key flows | 700 |

---

## Key Cross-References

### State Machine
- Definition: SRS-3 Section 1
- Implementation: packages/shared/src/state-machine.ts
- Database enum: SRS-2 Section 1 (TransactionStatus)
- Transitions tested: SRS-3 Section 1.2

### Security Claims
- All tagged with [VERIFY:migration], [VERIFY:test], [VERIFY:grep], [VERIFY:runtime], or [VERIFY:ci]
- Verification matrix: SRS-4 Section 15
- Audit checklist: SRS-4 Section 15.2

### Payment Flow
- Business rules: BRD Section 3
- User stories: PRD Sections 2-4
- Technical implementation: SRS-3 Sections 7-9
- API endpoints: SRS-2 Section 3.2

### Dispute Flow
- Business SLAs: BRD Section 6
- User stories: PRD (US-B005, US-B006, US-A003, US-A004)
- Workflow: SRS-3 Section 2
- API endpoints: SRS-2 Section 3.3

---

## Terminology

- **Payment hold** — Funds charged and retained until conditions met (NOT "escrow")
- **Conditional release** — Transfer of held funds upon delivery confirmation
- **Connected account** — Stripe Express account for providers
- **Platform fee** — Percentage retained by marketplace on each transaction
