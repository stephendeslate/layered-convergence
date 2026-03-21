# Layered Convergence — SDD Trials 11-49

Extends the [SDD Methodology](../trials/) from backend-only depth (v11.0, 34 failure modes, converged) to full-stack breadth. Each layer adds one domain, runs trials until convergence, then the next layer begins. All layers inherit previous conventions and failure modes.

## Corrective Notice

> **Trials 15-49 (original run) have been invalidated and archived to `_archive/`.**
>
> Scientific review found 6 structural gaps:
> 1. **No layer progression** — all 39 trials (T11-T49) stayed on Layer 1 (Integration Testing)
> 2. **Copied trials** — T41-T49 were byte-identical copies of T40
> 3. **Self-assessment bias** — builder scored their own code with no independent verification
> 4. **Suspicious FM count regularity** — failure mode counts followed a suspiciously smooth curve
> 5. **No cross-layer integration** — layers were never tested together
> 6. **Pre-allocated trial ranges** — fixed ranges prevented adaptive allocation based on actual convergence
>
> **Preserved:** Trials 11-14 (legitimate Layer 1 convergence, 4 FMs resolved).
> **Re-running:** Trials 15-49 (35 trial budget for Layers 2-8 + cross-layer integration).

## The Problem

> **No version of SDD achieves both breadth and depth.**

- **v1.0 (Trial 1)** = max breadth (full-stack monorepo), audited quality 6.5-8.0
- **v11.0 (Trial 10)** = max depth (34 failure modes, 100% resolved), backend-only

Layered Convergence systematically extends v11.0's depth mechanisms to every breadth domain v1.0 covered.

## Layer Architecture (Adaptive Allocation)

Trial ranges are **not pre-allocated**. Each layer uses min/max bounds with a shared reserve pool. Layers converge when they converge — or are honestly recorded as incomplete.

| Layer | Domain | Min | Max | Status |
|-------|--------|-----|-----|--------|
| L0 Backend API | Backend | 10 | 10 | Complete (T1-T10, 34 FMs) |
| L1 Integration Testing | Testing | 3 | 5 | Complete (T11-T14, 4 FMs) |
| L2 Frontend | UI | 5 | 8 | Pending |
| L3 Specifications | Specs | 3 | 5 | Pending |
| L4 Infrastructure | Infra | 3 | 5 | Pending |
| L5 Monorepo | Monorepo | 3 | 4 | Pending |
| L6 Security | Security | 3 | 5 | Pending |
| L7 Performance | Performance | 3 | 4 | Pending |
| L8 Monitoring | Monitoring | 3 | 4 | Pending |
| L9 Cross-Layer Integration | Integration | 2 | 3 | Pending |

**Budget:** 35 trials (T15-T49). Minimum required: 25. Reserve pool: 10.

## The Three Projects

Same 3 enterprise applications as Trials 1-10:

| Project | Domain | Key Challenges |
|---------|--------|----------------|
| **Analytics Engine (AE)** | Multi-tenant embeddable analytics | Data ingestion pipeline, SSE real-time, iframe embed API |
| **Escrow Marketplace (EM)** | Two-sided marketplace with payment holds | State machine lifecycle, Stripe Connect, dispute resolution |
| **Field Service Dispatch (FSD)** | Field service management SaaS | GPS tracking, route optimization, WebSocket gateways |

## Tech Stack

**Inherited from Layer 0:**
- NestJS 11, Prisma 6, PostgreSQL 16 (RLS), BullMQ + Redis, Vitest, TypeScript 5.7+

**Added per layer:**
- Layer 1: Docker Compose for test infrastructure (real PostgreSQL + Redis)
- Layer 2: Next.js 15, shadcn/ui, Tailwind CSS 4, Testing Library, axe-core
- Layer 3: 7-document spec hierarchy, VERIFY tags, SPEC-INDEX.md
- Layer 4: Docker, GitHub Actions CI/CD, Prisma migrations, seed scripts
- Layer 5: Turborepo 2, pnpm workspaces, `packages/shared`
- Layer 6: Helmet.js, rate-limiter-flexible, npm audit
- Layer 7: k6 / Vitest bench, Prisma query logging
- Layer 8: Pino structured logger, Sentry, /health endpoint

## Revised Convergence Criterion

A layer converges when:
1. **2 consecutive clean trials** — zero new failure modes in both
2. **All dimensions >= 8.0** — including layer-specific dimensions
3. **Independent audit delta <= 1.0** — scorer and builder scores within 1 point
4. **Cumulative regression check** — all prior layer verifications still pass

The methodology is complete when:
1. All layers have independently converged (or are recorded as "incomplete" with reason)
2. Cross-layer integration trial (L9) passes all cumulative checks
3. Final independent audit conducted and documented

## Independence Verification Protocol

Every trial is verified for independence via:
- **Source code hash** — sha256 of src/ directories must differ from previous trial
- **Diff check** — `diff -rq` against previous trial must show substantive changes
- **Timestamp verification** — build artifacts timestamped at creation time
- **Separated scoring** — builder and scorer are separate sessions; scorer never sees BUILD_REPORT.md

## Trial Process (3-Phase Protocol)

See [TRIAL_PROTOCOL.md](TRIAL_PROTOCOL.md) for the full protocol. Summary:

1. **Phase A (Pre-Build):** Determine layer, author addendum if first trial, create clean trial directory with variation seed
2. **Phase B (Build + Score):** Build 3 projects, run `verify-layer.sh`, independent scoring session, red-team session
3. **Phase C (Post-Trial):** Reconcile 3 score sources, produce REVISED_METHODOLOGY.md, update layers.json, check convergence

## Repository Structure

```
layered-convergence/
├── README.md
├── layers.json                        # Layer definitions with adaptive allocation
├── TRIAL_PROTOCOL.md                  # 3-phase execution protocol
├── verify-layer.sh                    # Automated verification script
├── METHODOLOGY_ADDENDUM_L2.md         # Layer 2 (Frontend) methodology
├── _archive/                          # Invalidated T15-T49 (audit trail)
│   └── trial15/ through trial49/
├── trial11/ through trial14/          # Layer 1 (complete)
├── trial15/                           # Layer 2 begins (corrective re-run)
│   ├── METHODOLOGY.md
│   ├── analytics-engine/
│   ├── escrow-marketplace/
│   └── field-service-dispatch/
└── ...through trial49/
```

## Predecessor

Built on 10 trials of SDD documented in [`~/projects/trials/`](../trials/). See the [SDD Methodology Analysis Report](../trials/SDD_METHODOLOGY_ANALYSIS_REPORT.md) for the complete cross-trial analysis and the layered convergence design.

## License

MIT
