# Layered Convergence — SDD Trials 11-49

Extends the [SDD Methodology](../trials/) from backend-only depth (v11.0, 34 failure modes, converged) to full-stack breadth. Each layer adds one domain, runs trials until convergence (0 new failure modes), then the next layer begins. All layers inherit previous conventions and failure modes.

## The Problem

> **No version of SDD achieves both breadth and depth.**

- **v1.0 (Trial 1)** = max breadth (full-stack monorepo), audited quality 6.5-8.0
- **v11.0 (Trial 10)** = max depth (34 failure modes, 100% resolved), backend-only

Layered Convergence systematically extends v11.0's depth mechanisms to every breadth domain v1.0 covered.

## Layer Architecture

```
Layer 0 (Complete): Backend API         — Trials 1-10,  34 FMs, converged
Layer 1 (Active):   Integration Testing — Trials 11-14, real DB + Redis E2E
Layer 2:            Frontend            — Trials 15-22, Next.js 15, accessibility
Layer 3:            Specifications      — Trials 23-27, spec-to-code traceability
Layer 4:            Infrastructure      — Trials 28-32, Docker, CI/CD, migrations
Layer 5:            Monorepo            — Trials 33-36, Turborepo, shared types
Layer 6:            Security (Broad)    — Trials 37-41, OWASP, CORS/CSP, audit
Layer 7:            Performance         — Trials 42-45, benchmarks, load testing
Layer 8:            Monitoring          — Trials 46-49, structured logging, APM
```

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

## Convergence Criterion

The master methodology is achieved when:
1. All layers have independently converged (0 new failure modes)
2. A final integration trial runs all layers simultaneously with 0 cross-layer failures
3. Scoring rubric produces >= 9.0 on every dimension simultaneously
4. Full-stack application built autonomously with no human intervention

## Trial Process

Each trial follows the same feedback loop as Trials 1-10:
1. Read `METHODOLOGY.md` (input)
2. Build 3 enterprise applications
3. Score against rubric
4. Produce `REVISED_METHODOLOGY.md` (output → next trial's input)

## Repository Structure

```
layered-convergence/
├── README.md
├── layers.json                        # Layer definitions (read by sdd-dashboard)
├── trial11/                           # Layer 1, Trial 1
│   ├── METHODOLOGY.md                 # v11.0 + Layer 1 integration testing
│   ├── analytics-engine/
│   ├── escrow-marketplace/
│   └── field-service-dispatch/
├── trial12/ through trial14/          # Layer 1 convergence
├── trial15/ through trial22/          # Layer 2 (Frontend)
└── ...through trial49/                # Layer 8 (Monitoring)
```

## Predecessor

Built on 10 trials of SDD documented in [`~/projects/trials/`](../trials/). See the [SDD Methodology Analysis Report](../trials/SDD_METHODOLOGY_ANALYSIS_REPORT.md) for the complete cross-trial analysis and the layered convergence design.

## License

MIT
