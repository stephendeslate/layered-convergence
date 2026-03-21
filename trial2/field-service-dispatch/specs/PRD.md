# Product Requirements Document (PRD)

## Field Service Dispatch & Management Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Overview

This document defines the product requirements through user stories with acceptance criteria
for all user roles: dispatchers, technicians, customers, and company administrators.

---

## 2. User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| ADMIN | Company owner/manager — full access to all features within their tenant | Full CRUD on all company data |
| DISPATCHER | Scheduling staff — manages work orders and technician assignments | CRUD work orders, view technicians, assign jobs |
| TECHNICIAN | Field worker — receives and completes jobs | View assigned jobs, update status, upload photos |
| CUSTOMER | End consumer — tracks technician and pays invoices | View own work order status, tracking portal, pay invoice |

---

## 3. Dispatcher User Stories

### DS-001: View Dispatch Board
**As a** dispatcher
**I want to** see a split-screen view with a map and Kanban board
**So that** I can efficiently manage and assign work orders

**Acceptance Criteria:**
- [ ] Left panel shows a Leaflet map with OpenStreetMap tiles
- [ ] Right panel shows Kanban columns for each work order status
- [ ] Map displays technician markers colored by primary skill
- [ ] Map displays customer/job markers colored by priority (red=urgent, orange=high, blue=normal, gray=low)
- [ ] Both panels show data scoped to the dispatcher's company only
- [ ] View updates in real-time via WebSocket without page refresh

### DS-002: Assign Work Order to Technician
**As a** dispatcher
**I want to** assign an unassigned work order to a specific technician
**So that** the technician knows which job to complete

**Acceptance Criteria:**
- [ ] Dispatcher can drag a work order from "Unassigned" to "Assigned" column
- [ ] A modal appears to select from available technicians (filtered by matching skills)
- [ ] Selected technician's ID is saved on the work order
- [ ] Work order status transitions from UNASSIGNED to ASSIGNED
- [ ] Transition is logged in WorkOrderStatusHistory
- [ ] Assigned technician receives a real-time notification

### DS-003: Auto-Assign Work Order
**As a** dispatcher
**I want to** click "Auto-Assign" on a work order
**So that** the system selects the best available technician automatically

**Acceptance Criteria:**
- [ ] System finds technicians with matching skills who are currently available
- [ ] Among matching technicians, selects the one closest to the job location (PostGIS distance)
- [ ] Only considers technicians from the same company
- [ ] If no matching technician is available, shows an error message
- [ ] Assignment is logged in WorkOrderStatusHistory with note "Auto-assigned"

### DS-004: View Optimized Routes
**As a** dispatcher
**I want to** see the optimized route for a technician on the map
**So that** I can verify the route makes sense before the technician starts

**Acceptance Criteria:**
- [ ] Clicking a technician marker shows their assigned route as a polyline on the map
- [ ] Route stops are numbered in optimized order
- [ ] Total estimated duration and distance are displayed
- [ ] Route is calculated via OpenRouteService Optimization API
- [ ] If OpenRouteService is unavailable, a cached route is shown (if available)

### DS-005: Optimize Technician Route
**As a** dispatcher
**I want to** trigger route optimization for a technician's daily assignments
**So that** the technician drives the minimum distance

**Acceptance Criteria:**
- [ ] Dispatcher clicks "Optimize Route" for a selected technician
- [ ] System sends all assigned job locations + technician start location to OpenRouteService
- [ ] Optimized stop order, duration, and distance are returned
- [ ] Route is saved and displayed on the map
- [ ] Route is cached in Redis

### DS-006: Monitor Technician Locations
**As a** dispatcher
**I want to** see all technicians' real-time positions on the map
**So that** I can make informed dispatch decisions

**Acceptance Criteria:**
- [ ] Each active technician has a marker on the map at their current GPS position
- [ ] Markers update in real-time as technicians move (WebSocket GPS stream)
- [ ] Clicking a marker shows technician name, current status, and assigned jobs
- [ ] Only technicians from the dispatcher's company are visible
- [ ] Markers show directional heading when available

### DS-007: Create Work Order
**As a** dispatcher
**I want to** create a new work order for a customer
**So that** it can be assigned and dispatched to a technician

**Acceptance Criteria:**
- [ ] Form includes: customer selection, service type, priority, scheduled date/time, description, address
- [ ] Address is geocoded to lat/lng coordinates
- [ ] Work order is created with UNASSIGNED status
- [ ] Work order appears in the "Unassigned" Kanban column
- [ ] Work order marker appears on the map at the customer's location

### DS-008: View Work Order Timeline
**As a** dispatcher
**I want to** see the full status history of a work order
**So that** I can understand what happened and when

**Acceptance Criteria:**
- [ ] Timeline shows all status transitions with timestamps
- [ ] Each entry shows: from status, to status, actor, timestamp, optional note
- [ ] Timeline is in chronological order
- [ ] Photos and notes added by technician are included

---

## 4. Technician User Stories

### TS-001: View My Job List
**As a** technician
**I want to** see my assigned jobs for today
**So that** I know what to work on and in what order

**Acceptance Criteria:**
- [ ] Shows only jobs assigned to the logged-in technician
- [ ] Jobs are ordered by optimized route sequence (if route exists) or scheduled time
- [ ] Each job shows: customer name, address, service type, priority, status
- [ ] Urgent/high priority jobs are visually highlighted
- [ ] Interface is mobile-responsive with large touch targets

### TS-002: Start Route to Job
**As a** technician
**I want to** tap "Start Route" on my next assigned job
**So that** the customer and dispatcher know I'm on my way

**Acceptance Criteria:**
- [ ] Work order status transitions from ASSIGNED to EN_ROUTE
- [ ] GPS tracking begins streaming position to the server
- [ ] A "Navigate" button opens the address in the device's default maps app
- [ ] Customer tracking portal (if active) shows technician position
- [ ] Dispatcher dashboard shows technician marker moving in real-time

### TS-003: Arrive at Job Site
**As a** technician
**I want to** tap "Arrived" when I reach the customer location
**So that** the system records my arrival time

**Acceptance Criteria:**
- [ ] Work order status transitions from EN_ROUTE to ON_SITE
- [ ] Arrival timestamp is recorded in WorkOrderStatusHistory
- [ ] Customer receives notification that technician has arrived
- [ ] Button is large and easy to tap with work gloves

### TS-004: Start and Complete Work
**As a** technician
**I want to** mark a job as "In Progress" and then "Completed"
**So that** the work status is accurately tracked

**Acceptance Criteria:**
- [ ] "Start Work" button transitions from ON_SITE to IN_PROGRESS
- [ ] "Complete" button transitions from IN_PROGRESS to COMPLETED
- [ ] Completion requires at least one photo upload (configurable)
- [ ] Technician can add completion notes
- [ ] Completion triggers invoice generation

### TS-005: Upload Job Photos
**As a** technician
**I want to** take and upload photos of completed work
**So that** there is documentation of the job

**Acceptance Criteria:**
- [ ] Camera capture or gallery upload supported
- [ ] Multiple photos can be uploaded per job
- [ ] Photos are associated with the work order
- [ ] Optional caption per photo
- [ ] Photos are stored and viewable from the work order detail

### TS-006: Stream GPS Position
**As a** technician
**I want** my position to be tracked while en route
**So that** customers and dispatchers can see my location

**Acceptance Criteria:**
- [ ] `navigator.geolocation.watchPosition()` captures position at regular intervals
- [ ] Position is sent via WebSocket to the server
- [ ] Server broadcasts position only to the technician's company room
- [ ] Position updates include: lat, lng, timestamp, heading, speed
- [ ] Tracking can be paused/resumed

---

## 5. Customer User Stories

### CS-001: Track My Technician
**As a** customer
**I want to** see where my technician is and when they'll arrive
**So that** I can plan my time and not wait at the window

**Acceptance Criteria:**
- [ ] Customer receives SMS/email with a unique tracking link
- [ ] Tracking page shows a live map with the technician's current position
- [ ] ETA is displayed: "Your technician is X minutes away"
- [ ] ETA updates in real-time as technician moves
- [ ] Status timeline shows: Dispatched → En Route → Arriving → On Site
- [ ] No login required — link contains a secure token
- [ ] Only the assigned technician's position is shown (not all technicians)

### CS-002: View Work Order Status
**As a** customer
**I want to** see the current status of my service request
**So that** I know what's happening with my job

**Acceptance Criteria:**
- [ ] Shows work order details: service type, scheduled date, technician name
- [ ] Shows current status with visual indicator
- [ ] Shows estimated completion time (if available)
- [ ] Updates in real-time without refresh

### CS-003: Pay Invoice
**As a** customer
**I want to** pay my service invoice online
**So that** I don't have to write a check or call in payment

**Acceptance Criteria:**
- [ ] Invoice page shows: service details, labor, total amount
- [ ] Stripe payment form is embedded
- [ ] Successful payment transitions work order to PAID
- [ ] Payment confirmation is displayed
- [ ] Receipt is available for download/email

### CS-004: View Service History
**As a** customer
**I want to** see my past service visits
**So that** I have a record of work performed

**Acceptance Criteria:**
- [ ] Shows list of past work orders with dates and status
- [ ] Each entry shows: date, service type, technician, status, amount
- [ ] Can view details including photos and notes from technician
- [ ] Only shows work orders for the logged-in customer

---

## 6. Admin User Stories

### AD-001: Manage Company Settings
**As a** company admin
**I want to** configure my company's settings
**So that** the platform reflects my business

**Acceptance Criteria:**
- [ ] Can set company name, logo, service area
- [ ] Can configure working hours
- [ ] Settings are tenant-isolated — only affects own company
- [ ] Changes take effect immediately

### AD-002: Manage Technicians
**As a** company admin
**I want to** add, edit, and deactivate technicians
**So that** my team roster stays current

**Acceptance Criteria:**
- [ ] Add technician: name, email, phone, skills (multi-select), hourly rate
- [ ] Edit technician details and skills
- [ ] Deactivate (not delete) technicians who leave
- [ ] View technician list with status, skills, and assigned job count
- [ ] Technicians are scoped to the admin's company

### AD-003: Manage Service Catalog
**As a** company admin
**I want to** define the types of services my company offers
**So that** work orders can be categorized correctly

**Acceptance Criteria:**
- [ ] Add/edit/remove service types (e.g., "HVAC Repair", "Plumbing Emergency")
- [ ] Each service type has: name, description, default duration, default price
- [ ] Service types are used in work order creation
- [ ] Service types are company-scoped

### AD-004: View Analytics Dashboard
**As a** company admin
**I want to** see operational analytics
**So that** I can identify inefficiencies and make data-driven decisions

**Acceptance Criteria:**
- [ ] Dashboard shows: jobs completed today, this week, this month
- [ ] Average job completion time (from assigned to completed)
- [ ] Technician utilization (% of working hours on jobs)
- [ ] Revenue: invoiced amount, paid amount, outstanding
- [ ] Charts are visually clear and update with filter changes
- [ ] Data is scoped to the admin's company only

### AD-005: Manage Customers
**As a** company admin
**I want to** manage my customer database
**So that** I can create work orders for existing customers

**Acceptance Criteria:**
- [ ] Add customer: name, address, phone, email, notes
- [ ] Edit customer details
- [ ] View customer service history
- [ ] Search customers by name, address, or phone
- [ ] Customers are scoped to the admin's company

---

## 7. System User Stories

### SY-001: WebSocket Authentication
**As the** system
**I need to** authenticate all WebSocket connections
**So that** unauthorized users cannot access real-time data

**Acceptance Criteria:**
- [ ] WebSocket handshake requires a valid JWT token
- [ ] Token is validated on connection — invalid tokens are rejected immediately
- [ ] Company ID from token is used to join the correct company room
- [ ] Connections without tokens receive an authentication error
- [ ] Token expiration is checked on connection

### SY-002: Tenant Data Isolation
**As the** system
**I need to** enforce strict data isolation between companies
**So that** one company's data is never exposed to another

**Acceptance Criteria:**
- [ ] Every table with `companyId` has a PostgreSQL RLS policy
- [ ] RLS policies use `current_setting('app.company_id')` for filtering
- [ ] Middleware sets `app.company_id` from JWT before each request
- [ ] Integration tests verify Company A cannot access Company B's data
- [ ] GPS WebSocket rooms are company-scoped

### SY-003: Rate Limiting
**As the** system
**I need to** limit request rates on public endpoints
**So that** the platform is protected from abuse

**Acceptance Criteria:**
- [ ] Rate limiter is registered in the NestJS application
- [ ] Rate limits are applied to all API routes
- [ ] GPS WebSocket updates are rate-limited per connection
- [ ] Rate limit exceeded responses return 429 status
- [ ] Different limits for different endpoint categories

### SY-004: Input Validation
**As the** system
**I need to** validate all incoming data
**So that** invalid data does not corrupt the database

**Acceptance Criteria:**
- [ ] All DTOs use class-validator decorators
- [ ] Validation pipe is enabled globally
- [ ] Invalid input returns 400 with descriptive error messages
- [ ] SQL injection is prevented by using Prisma parameterized queries
- [ ] No `$queryRawUnsafe` usage anywhere in the codebase

---

## 8. Non-Functional Requirements

### 8.1 Performance
- API response time: < 200ms (95th percentile)
- Map rendering: < 1 second for initial tile load
- WebSocket GPS updates: < 500ms delivery latency
- Route optimization: < 5 seconds for 20 stops
- Photo upload: < 10 seconds for 5MB image

### 8.2 Usability
- Technician UI: completable with 5 or fewer taps per job
- Dispatcher UI: drag-and-drop assignment in under 3 seconds
- Customer portal: understandable without instructions
- Mobile-responsive: all views usable on 375px+ screens

### 8.3 Security
- JWT tokens with expiration and refresh
- HTTPS everywhere (enforced by deployment platform)
- No credentials in client-side code
- RLS at database level for defense-in-depth
- WebSocket authentication on handshake

### 8.4 Reliability
- Graceful degradation when external services are unavailable
- Error boundaries in React prevent full-page crashes
- Queue-based processing for non-critical operations (notifications, analytics)

---

## 9. Feature Priority Matrix

| Feature | Priority | Phase |
|---------|----------|-------|
| Work order CRUD + state machine | P0 | C2 |
| Dispatch board (map + Kanban) | P0 | C4 |
| GPS tracking + WebSocket | P0 | C3 |
| Technician mobile UI | P0 | C4 |
| Customer tracking portal | P0 | C4 |
| Route optimization | P1 | C2 |
| Auto-assign | P1 | C2 |
| Invoice generation | P1 | C3 |
| Stripe payment | P1 | C3 |
| Photo upload | P1 | C3 |
| Analytics dashboard | P2 | C4 |
| Admin panel | P2 | C4 |
| SMS notifications | P2 | C3 |
| Service catalog | P2 | C4 |

---

## 10. Dependencies

### External Dependencies
| Dependency | Risk | Mitigation |
|------------|------|------------|
| OpenRouteService API | Rate limits, downtime | Caching, mock fallback (throws in prod) |
| Stripe API | Downtime | Queue payment retries, graceful error handling |
| OpenStreetMap tile servers | Slow/unavailable | Multiple tile server URLs, local caching |
| PostGIS extension | Setup complexity | Use managed PostgreSQL with PostGIS support |

### Internal Dependencies
| Component | Depends On | Reason |
|-----------|------------|--------|
| Dispatch Board | Work Orders, Technicians, GPS Gateway | Displays all data in unified view |
| Customer Portal | GPS Gateway, Work Orders | Shows technician position and job status |
| Route Optimization | Work Orders, Technicians | Needs job locations and technician start |
| Invoice Generation | Work Orders | Triggered by job completion |
| Auto-Assign | Technicians, PostGIS | Needs proximity calculation and skill matching |

---

## 11. Out of Scope

Items explicitly excluded from this version:
1. Native mobile applications
2. Offline-first functionality
3. Inventory/parts management
4. Customer quoting and estimates
5. Recurring/scheduled job templates
6. Multi-language internationalization
7. White-label per-tenant branding
8. Third-party integrations (QuickBooks, Zapier)
9. Advanced reporting/BI
10. Customer self-service booking
