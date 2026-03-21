# Product Vision Document (PVD)

**Project:** Field Service Dispatch
**Version:** 1.0
**Date:** 2026-03-20
**Status:** Draft

---

## 1. Executive Summary

Field Service Dispatch is a multi-tenant SaaS platform that enables field service companies to manage their operations end-to-end: scheduling and dispatching jobs, tracking technicians in real time on a live map, optimizing routes, managing work orders, invoicing customers, and providing customers with live arrival tracking. The platform replaces fragmented workflows (phone calls, spreadsheets, paper forms) with a unified digital system built on open-source mapping technology.

## 2. Problem Statement

Field service companies — HVAC, plumbing, electrical, cleaning, pest control, and similar trades — face persistent operational challenges:

1. **Inefficient dispatching.** Dispatchers manually assign jobs based on gut feeling, lacking visibility into technician locations, current workloads, or optimal routing. This leads to longer drive times, missed appointments, and uneven workload distribution.

2. **No real-time visibility.** Office staff cannot see where technicians are or what status a job is in. Customers call in repeatedly asking "Where is my technician?" and dispatchers have no answer without phoning the technician directly.

3. **Paper-based work orders.** Many companies still use paper work orders or disconnected spreadsheets. Job details get lost, status updates are delayed, and there is no reliable audit trail.

4. **Manual invoicing.** After a job is completed, someone in the office manually creates an invoice — often days later. This delays cash flow and introduces errors.

5. **No route optimization.** Technicians drive inefficient routes, wasting fuel and time. Companies with 10+ technicians can lose thousands of dollars monthly to suboptimal routing.

6. **Poor customer experience.** Customers receive vague arrival windows ("between 8 AM and 12 PM") with no real-time updates. This is the number-one source of customer complaints in field service.

### Market Size

The global field service management market was valued at approximately $5.2 billion in 2024 and is projected to reach $9.7 billion by 2029. Small-to-medium field service businesses (5-50 technicians) represent the largest underserved segment.

## 3. Vision Statement

**Enable any field service company to dispatch, track, and manage their operations with the efficiency of a Fortune 500 logistics operation — at a price point accessible to a 5-person shop.**

## 4. Personas

### 4.1 Dispatcher — Dana

- **Role:** Office manager / dispatcher at a mid-size HVAC company (15 technicians)
- **Age:** 34
- **Technical proficiency:** Moderate — comfortable with web apps but not a developer
- **Goals:**
  - See all technicians on a live map at a glance
  - Assign and reassign jobs quickly via drag-and-drop
  - Minimize drive time across the team
  - Respond to customer inquiries with accurate ETAs
- **Pain points:**
  - Currently juggles a whiteboard, spreadsheet, and phone calls
  - Spends 30 minutes each morning building the schedule manually
  - Gets 20+ "where's my tech?" calls per day
- **Success criteria:** Reduce daily scheduling time from 30 minutes to 5 minutes; eliminate customer ETA calls

### 4.2 Technician — Tyler

- **Role:** Senior HVAC technician, 8 years experience
- **Age:** 28
- **Technical proficiency:** Low-moderate — uses smartphone daily but prefers simple interfaces
- **Goals:**
  - See his daily job list with addresses and details
  - Navigate to jobs with one tap
  - Update job status quickly (en route, on site, completed)
  - Capture photos and notes on the job
- **Pain points:**
  - Currently receives job details via phone call or text message
  - Has to call the office to get the next job
  - Handwrites notes that sometimes get lost
- **Success criteria:** Zero phone calls to office for job details; all notes and photos captured digitally

### 4.3 Customer — Carol

- **Role:** Homeowner waiting for a plumber
- **Age:** 45
- **Technical proficiency:** Basic — can follow a link and view a web page
- **Goals:**
  - Know exactly when the technician will arrive
  - See the technician's location on a map in real time
  - Receive the invoice promptly after service
  - Pay online
- **Pain points:**
  - Waits at home for hours during a vague service window
  - Has to call the office to check on technician status
  - Receives paper invoices in the mail days later
- **Success criteria:** Receives a tracking link with live ETA; invoice delivered within minutes of job completion

### 4.4 Company Admin — Alex

- **Role:** Owner of a 20-person electrical services company
- **Age:** 52
- **Technical proficiency:** Moderate
- **Goals:**
  - Understand operational efficiency (jobs per day, utilization rate)
  - Control costs (fuel, overtime)
  - Grow revenue by serving more customers per day
  - Manage team performance
- **Pain points:**
  - No visibility into daily operations without calling dispatchers
  - Cannot measure technician utilization or identify bottlenecks
  - Invoicing delays hurt cash flow
- **Success criteria:** Real-time dashboard showing KPIs; 15% improvement in jobs completed per day within 3 months

## 5. Competitive Landscape

| Feature | ServiceTitan | Jobber | Housecall Pro | **Field Service Dispatch** |
|---------|-------------|--------|---------------|---------------------------|
| Work order management | Yes | Yes | Yes | Yes |
| Drag-and-drop dispatch | Yes | Limited | Yes | Yes |
| Real-time GPS tracking | Yes | No | Limited | Yes |
| Live customer tracking | No | No | No | **Yes** |
| Route optimization | Limited | No | No | **Yes** |
| Open-source mapping | No | No | No | **Yes** |
| Multi-tenant | Yes | Yes | Yes | Yes |
| Starting price | $398/mo | $69/mo | $65/mo | **$49/mo** |

### Differentiation

1. **Live customer tracking portal** — No competitor offers a real-time "Uber-like" tracking experience for field service customers.
2. **Route optimization** — Built-in route optimization using OpenRouteService reduces drive time and fuel costs. Competitors either lack this or charge extra.
3. **Open-source mapping stack** — Using Leaflet + OpenStreetMap + OpenRouteService avoids vendor lock-in and the licensing restrictions of proprietary mapping APIs (which prohibit dispatch/fleet use cases).
4. **Price accessibility** — Lower starting price targets the underserved small-business segment.

## 6. Product Principles

1. **Real-time by default.** Every piece of data should update live — map positions, job statuses, ETAs. No manual refresh needed. Stale data leads to bad decisions in dispatch; the system must eliminate it.

2. **Mobile-first for field users.** Technicians work on phones in bright sunlight with dirty hands. The mobile UI must be simple, high-contrast, and operable with large touch targets (minimum 44px). One-handed operation should be possible for all critical actions (status updates, navigation launch).

3. **Dispatcher efficiency.** The dispatch board is the command center. Every action should be achievable in minimal clicks. A dispatcher managing 20 technicians and 100+ daily work orders should never feel overwhelmed by the UI. Drag-and-drop is the primary interaction model.

4. **Transparent to customers.** Customers should never need to call and ask "Where is my technician?" The tracking portal should provide an Uber-like experience: a live map showing the technician's position, a real-time ETA, and proactive SMS notifications as the technician approaches.

5. **Multi-tenant isolation.** Every company's data is completely isolated. There is zero cross-tenant data leakage. This is enforced at the database level (PostgreSQL Row Level Security), not just in application code.

6. **Open-source mapping.** The platform avoids proprietary mapping APIs whose terms of service prohibit dispatch and fleet management use cases. Leaflet, OpenStreetMap, and OpenRouteService provide equivalent functionality without legal risk or vendor lock-in.

7. **Graceful degradation.** When external services are unavailable (routing API, payment processor, notification service), the core dispatch workflow must continue to function. The system queues failed operations and retries when services recover.

## 7. Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Dispatcher scheduling time | < 5 min/day | In-app timing analytics |
| Customer ETA accuracy | Within 5 minutes of actual arrival | Compare predicted vs actual arrival timestamps |
| Jobs completed per technician per day | 15% increase within 90 days | Work order completion analytics |
| Invoice delivery time | < 5 minutes after job completion | Timestamp delta: completion to invoice sent |
| GPS update latency | < 2 seconds end-to-end | Server-side latency monitoring |
| Map render time | < 1 second for 50 markers | Client-side performance monitoring |
| Customer satisfaction (CSAT) | > 4.5/5.0 | Post-service survey |
| System uptime | 99.9% | Infrastructure monitoring |

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OpenRouteService rate limits (2,000 req/day free tier) | High | Medium | Cache routes aggressively; batch optimization requests; implement OSRM fallback for directions |
| WebSocket scalability under high concurrent connections | Medium | High | Horizontal scaling with Redis adapter for Socket.io; connection pooling; load testing at 500+ concurrent connections |
| GPS accuracy in urban canyons / indoor | Medium | Medium | Use browser geolocation API with fallback to last known position; display accuracy radius on map |
| Customer portal abuse (DDoS on tracking links) | Low | Medium | Rate limiting on portal endpoints; short-lived tracking tokens; CDN caching for static assets |
| PostGIS hosting complexity on Railway | Medium | Low | Use Railway PostGIS template; document setup; provide migration scripts |
| Technician phone battery drain from continuous GPS | High | Medium | Configurable update frequency (default 10s); batch GPS updates; reduce frequency when stationary |
| Multi-tenant data leakage | Low | Critical | PostgreSQL Row Level Security on all tables; integration tests verifying tenant isolation; security audit |
| Stripe integration complexity for invoicing | Low | Low | Use Stripe Invoicing API directly; handle webhooks for payment confirmation |

## 9. Key User Journeys

### 9.1 Morning Dispatch Flow

Dana (Dispatcher) arrives at 7:30 AM. She opens the dispatch dashboard and sees today's date pre-selected. The Kanban board shows 8 unassigned work orders in the leftmost column. She clicks "Optimize All Routes" to auto-assign and optimize the team's routes. The system assigns work orders based on technician skills, proximity, and capacity. Dana reviews the assignments, makes two manual adjustments by dragging cards between technicians, and confirms. Each technician receives a push notification with their daily schedule.

### 9.2 Technician Day Flow

Tyler (Technician) opens the mobile UI on his phone at 8:00 AM. He sees 5 jobs listed in optimized route order. He taps "Start Driving" on his first job, which launches his phone's maps app for navigation and begins GPS streaming. Carol (Customer) receives an SMS with a tracking link. Tyler arrives, taps "Arrived," completes the work, takes a photo of the repair, adds a note, and taps "Complete Job." The invoice is generated automatically. Tyler moves to his next job.

### 9.3 Customer Tracking Flow

Carol receives an SMS: "Tyler from Acme HVAC is on the way! Track arrival: [link]." She opens the link on her phone and sees a map with Tyler's live position and "ETA: 12 minutes." The ETA counts down in real time. She gets another SMS at 5 minutes out. Tyler arrives, and the tracking page shows "Your technician has arrived!" After the job, Carol receives an email with an invoice link and pays online.

## 10. Scope

### In Scope (v1.0)

- Multi-tenant company management
- Work order lifecycle (create through payment)
- Drag-and-drop Kanban dispatch board
- Real-time GPS tracking with live map
- Route optimization for daily schedules
- Customer tracking portal with live ETA
- Technician mobile web UI
- Automated invoicing via Stripe
- Basic analytics dashboard
- SMS and email notifications
- Simulated GPS mode for demos

### Out of Scope (v1.0)

- Native mobile apps (iOS/Android) — using responsive web
- Inventory/parts management
- Recurring job scheduling
- Multi-language / i18n
- Offline mode for technicians
- Integration with third-party CRMs
- Custom forms / checklists
- Payroll integration
- White-label / custom branding

## 10. Release Strategy

| Phase | Timeline | Deliverables |
|-------|----------|-------------|
| Alpha | Weeks 1-6 | Core work order management, dispatch board, basic map |
| Beta | Weeks 7-10 | GPS tracking, route optimization, customer portal |
| RC | Weeks 11-12 | Invoicing, analytics, notifications, polish |
| GA | Week 13 | Production deployment, onboarding documentation |

## 11. Cross-References

- Business requirements: §BRD
- Product requirements: §PRD
- Architecture: §SRS-1
- Data model: §SRS-2
- Domain logic: §SRS-3
- Security: §SRS-4
- UI specifications: §WIREFRAMES

---

*End of Product Vision Document*
