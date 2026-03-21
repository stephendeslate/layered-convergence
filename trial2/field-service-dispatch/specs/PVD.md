# Product Vision Document (PVD)

## Field Service Dispatch & Management Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Problem Statement

### 1.1 Industry Context

Field service companies — HVAC, plumbing, electrical, appliance repair, pest control — rely on
coordinating technicians across geographic areas to fulfill customer service requests. The
operational challenge is significant: dispatchers must match the right technician (skills,
availability, proximity) to the right job, minimize drive time, keep customers informed, and
manage the administrative burden of invoicing and payment collection.

### 1.2 Current Pain Points

1. **Manual Dispatch Inefficiency:** Many small-to-medium service companies still use
   whiteboards, spreadsheets, or phone-based dispatch. Dispatchers spend 30-40% of their time
   on coordination calls rather than strategic scheduling.

2. **Customer Communication Gap:** Customers receive vague time windows ("between 8 AM and
   noon") with no visibility into technician location or ETA. This leads to frustration,
   missed appointments, and negative reviews.

3. **Route Inefficiency:** Without optimization, technicians drive 20-35% more miles than
   necessary, wasting fuel, time, and reducing daily job capacity.

4. **Status Tracking Blind Spots:** Dispatchers lack real-time visibility into which jobs are
   in progress, which technicians are available, and where bottlenecks are forming.

5. **Paper-Based Workflows:** Job completion, photo documentation, and invoicing are often
   disconnected processes involving paper forms, separate photo uploads, and manual invoice
   creation.

6. **Multi-Location Complexity:** Companies operating across multiple service areas or with
   multiple teams need tenant-isolated data management that most basic tools don't provide.

### 1.3 Market Gap

Enterprise solutions (ServiceTitan, Salesforce Field Service) cost $150-300+/user/month and
require lengthy implementations. Small-to-medium companies (5-50 technicians) need affordable,
modern tools but are priced out of enterprise platforms.

Open-source alternatives exist but lack real-time GPS tracking, route optimization, and
customer-facing portals — the three features that most differentiate dispatch platforms.

---

## 2. Target Users

### 2.1 Primary Users

#### Service Company Administrators
- **Profile:** Business owners or operations managers of field service companies
- **Size:** 5-50 technicians, 1-5 dispatchers
- **Needs:** Company-wide visibility, technician management, financial reporting, multi-tenant
  data isolation
- **Tech Comfort:** Moderate — comfortable with web applications, expect mobile-friendly interfaces

#### Dispatchers
- **Profile:** Dedicated dispatch staff or dual-role admin/dispatchers
- **Daily Volume:** 20-100 work orders per day
- **Needs:** Map-based dispatch board, drag-and-drop assignment, real-time technician tracking,
  route optimization, priority management
- **Key Metric:** Jobs dispatched per hour, average technician utilization

#### Field Technicians
- **Profile:** Mobile workers performing on-site service (HVAC, plumbing, electrical, etc.)
- **Devices:** Smartphones (primarily Android, some iOS)
- **Needs:** Job list with navigation, one-tap status updates, photo upload for documentation,
  minimal data entry
- **Key Constraint:** Working with gloves, in poor lighting, with intermittent connectivity

### 2.2 Secondary Users

#### Customers (End Consumers)
- **Profile:** Homeowners or business managers awaiting service
- **Needs:** Real-time technician ETA ("your technician is 12 minutes away"), live map,
  appointment status timeline, invoice payment
- **Interaction:** Receive SMS/email link to tracking portal, no account creation required

---

## 3. Value Proposition

### 3.1 Core Value

**"See every technician, optimize every route, keep every customer informed — in real time."**

The platform transforms field service operations from phone-and-spreadsheet chaos into a
real-time, map-driven command center. Dispatchers see all technicians on a live map, drag
jobs to the optimal technician, and let the system optimize routes. Customers see their
technician approaching on a live map with a real ETA.

### 3.2 Key Differentiators

| Feature | This Platform | Basic Tools | Enterprise (ServiceTitan) |
|---------|--------------|-------------|--------------------------|
| Live GPS tracking | Yes (WebSocket) | No | Yes |
| Route optimization | Yes (OpenRouteService) | No | Yes (Google Maps - ToS risk) |
| Customer tracking portal | Yes (live map + ETA) | No | Limited |
| Multi-tenant isolation | Yes (RLS) | No | Yes |
| Real-time dispatch board | Yes (map + Kanban) | Spreadsheet | Yes |
| Open-source mapping | Yes (Leaflet + OSM) | N/A | No (Google Maps) |
| Price point | Affordable | Free/Cheap | $150-300/user/mo |

### 3.3 Quantified Benefits

- **20-30% reduction in drive time** through route optimization
- **40% reduction in customer "where's my technician" calls** via live tracking portal
- **15-20% increase in daily job capacity** from optimized scheduling
- **50% faster invoicing** through automated invoice generation on job completion
- **Near-zero dispatch errors** with skill-matching and availability-aware assignment

---

## 4. Competitive Analysis

### 4.1 Direct Competitors

#### ServiceTitan
- **Strengths:** Comprehensive feature set, deep integrations, strong brand
- **Weaknesses:** $150-300+/user/month, 6-month implementation, uses Google Maps (ToS risk
  for fleet management)
- **Our Advantage:** Open-source mapping (no ToS risk), affordable pricing, modern tech stack

#### Housecall Pro
- **Strengths:** Easy to use, good mobile app, affordable entry tier
- **Weaknesses:** Limited route optimization, no live GPS tracking, basic dispatch
- **Our Advantage:** Real-time GPS, route optimization, customer tracking portal

#### Jobber
- **Strengths:** Good small-business features, quoting, CRM
- **Weaknesses:** No real-time tracking, basic scheduling, limited multi-tenant
- **Our Advantage:** Live map dispatch, multi-tenant architecture, WebSocket real-time updates

#### FieldPulse
- **Strengths:** Affordable, decent mobile app
- **Weaknesses:** No route optimization, limited GPS tracking
- **Our Advantage:** Full route optimization, live customer portal

### 4.2 Indirect Competitors

- **Google Sheets + Google Maps:** Free but manual, no automation, no real-time
- **Trello/Asana:** Task management without field service specifics
- **WhatsApp Groups:** Ad-hoc communication, no structure or tracking

### 4.3 Competitive Position

We target the **underserved middle market**: companies too large for spreadsheets but unable
to justify $10K+/month for ServiceTitan. Our open-source mapping stack eliminates the legal
risk of Google Maps API usage for fleet management — a risk many competitors carry.

---

## 5. Product Principles

1. **Map-First Interface:** The map is the primary interface for dispatch. Every decision
   starts with seeing where technicians and jobs are located.

2. **Real-Time by Default:** Every status change, location update, and assignment propagates
   instantly via WebSocket. No refresh buttons.

3. **Minimal Technician Input:** Technicians should complete their workflow with fewer than
   5 taps per job. Large touch targets, clear actions.

4. **Customer Transparency:** Customers deserve to know exactly when their technician will
   arrive, not a 4-hour window.

5. **Tenant Isolation as Architecture:** Multi-tenancy is not an afterthought — it's enforced
   at the database level (RLS) so data leaks are structurally impossible.

6. **Open Mapping Stack:** No dependency on Google Maps. Leaflet + OpenStreetMap +
   OpenRouteService provides full functionality without ToS restrictions.

---

## 6. Success Metrics

### 6.1 Platform Metrics
- **Dispatch efficiency:** Jobs dispatched per dispatcher per hour
- **Route optimization savings:** % reduction in total drive distance vs. naive ordering
- **Real-time latency:** GPS position update delivered to dashboard in < 500ms
- **Customer portal usage:** % of customers who check tracking link

### 6.2 Business Metrics
- **Technician utilization:** % of working hours spent on jobs vs. driving/idle
- **First-time fix rate:** % of jobs completed in first visit
- **Invoice-to-payment time:** Average days from job completion to payment received
- **Customer satisfaction:** NPS score from post-service survey

---

## 7. Scope and Boundaries

### 7.1 In Scope (MVP)
- Multi-tenant company management
- Work order lifecycle (create → assign → dispatch → complete → invoice → pay)
- Live map dispatch board with Kanban columns
- GPS tracking with WebSocket streaming
- Route optimization via OpenRouteService
- Customer tracking portal with live ETA
- Technician mobile-responsive UI
- Invoice generation and Stripe payment
- Photo upload for job documentation
- Simulated GPS for demo purposes

### 7.2 Out of Scope (Future)
- Native mobile apps (iOS/Android) — responsive web for MVP
- Inventory/parts management
- Customer CRM with sales pipeline
- Quoting and estimates
- Recurring job scheduling
- Multi-language support
- Offline-first technician app
- White-label/custom branding per tenant
- Advanced analytics and BI dashboards
- Integration marketplace (QuickBooks, etc.)

---

## 8. Technical Vision

### 8.1 Architecture Principles
- **Monorepo:** Turborepo with shared packages for type safety across frontend and backend
- **Database-Level Security:** PostgreSQL RLS policies enforce tenant isolation — no
  application-level filtering bugs can leak data
- **Real-Time Architecture:** WebSocket gateway for GPS streaming, job updates, and
  notifications — not polling
- **Open Mapping:** Leaflet + OpenStreetMap tiles + OpenRouteService APIs — legally clean,
  free tier sufficient for SMB usage
- **Type Safety:** Shared TypeScript types and enums between frontend and backend — state
  machine is single source of truth in shared package

### 8.2 Key Technology Choices
| Component | Choice | Rationale |
|-----------|--------|-----------|
| Backend | NestJS 11 | Modular, TypeScript-native, WebSocket support built-in |
| ORM | Prisma 6 | Type-safe queries, migration management, PostGIS support |
| Database | PostgreSQL 16 + PostGIS | RLS for multi-tenancy, spatial queries for proximity |
| Frontend | Next.js 15 | App Router, SSR, excellent DX |
| UI | shadcn/ui + Tailwind CSS 4 | Modern, accessible, customizable components |
| Maps | Leaflet + React Leaflet | Open source, no ToS restrictions, excellent ecosystem |
| Real-time | Socket.io | Reliable WebSocket with fallback, rooms for tenant isolation |
| Queue | BullMQ + Redis | Job scheduling, route recalculation, notification delivery |
| Payments | Stripe | Industry standard, invoicing API, payment intents |
| Testing | Vitest | Fast, ESM-native, compatible with NestJS via unplugin-swc |

---

## 9. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| OpenRouteService rate limits | Route optimization unavailable | Medium | Cache routes, batch daily, OSRM self-host fallback |
| WebSocket scaling | Connections drop under load | Low (demo scale) | Redis adapter for horizontal scaling |
| PostGIS setup complexity | Spatial queries fail | Medium | Use Railway PostGIS template, test early |
| Leaflet SSR crash | Next.js build fails | High if not handled | `next/dynamic` with `ssr: false` for all map components |
| Cross-tenant data leak | Security breach | Low (RLS enforced) | RLS policies + integration tests verifying isolation |
| Mobile UX quality | Technicians can't use in field | Medium | Large touch targets, minimal input, field testing |

---

## 10. Timeline

**Target:** 2-week sprint to functional MVP with demo capability.

- **Week 1:** Core dispatch, maps, route optimization, work order lifecycle
- **Week 2:** Real-time GPS, customer portal, technician UI, invoicing, polish

**Demo Readiness:** Simulated GPS movement along optimized routes, split-screen dispatch
board, customer tracking portal with live ETA.
