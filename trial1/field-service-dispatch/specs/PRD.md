# Product Requirements Document (PRD)

**Project:** Field Service Dispatch
**Version:** 1.0
**Date:** 2026-03-20
**Status:** Draft

---

## 1. Purpose

This document specifies the functional requirements for the Field Service Dispatch platform. Each requirement traces to a business requirement (§BRD) or persona (§PVD). Requirements are organized by feature area and include user stories with acceptance criteria.

## 2. Functional Requirements

### 2.1 Work Order Management

**FR-100: Create Work Order** (traces to §BRD BR-200, Persona: Dana)
The system must allow dispatchers and admins to create work orders with the following fields:
- Customer (select or create new)
- Service type (enum: see §SRS-2)
- Priority (LOW, NORMAL, HIGH, URGENT)
- Description (free text, max 2000 chars)
- Scheduled date and time window (start, end)
- Address (street, city, state, zip, with geocoding to lat/lng)
- Estimated duration (minutes)
- Line items (labor hours, materials, flat-rate fees)

**User Story:** As a dispatcher, I want to create a work order with all job details so that a technician has everything they need to complete the job.

**Acceptance Criteria:**
1. Form validates all required fields before submission
2. Address is geocoded to lat/lng via OpenRouteService geocoding or Nominatim
3. Work order is created in UNASSIGNED state
4. Work order appears on the dispatch board immediately
5. Service area warning displays if address is outside the company's defined area (§BRD BR-204)

**FR-101: Edit Work Order** (traces to §BRD BR-200, Persona: Dana)
Dispatchers and admins may edit work order details at any state except INVOICED and PAID. Edits to scheduled time must re-validate technician availability.

**Acceptance Criteria:**
1. All fields are editable except status (which is managed by state transitions)
2. Edit is rejected for INVOICED and PAID work orders with an appropriate error message
3. Editing scheduled time triggers overlap validation (§BRD BR-205)
4. Edit history is recorded in the audit log

**FR-102: View Work Order Detail** (traces to §BRD BR-202, Persona: Dana, Tyler)
The work order detail page displays:
- All work order fields
- Status timeline (visual history of all state transitions with timestamps)
- Assigned technician with current status
- Attached photos and notes
- Map showing work order location
- Invoice information (if applicable)

**Acceptance Criteria:**
1. All fields render correctly
2. Status timeline shows chronological transitions with actor names and timestamps
3. Photos display as a gallery with zoom capability
4. Map centers on the work order address with a marker

**FR-103: Work Order State Transitions** (traces to §BRD BR-200, BR-202)
The system must enforce the work order state machine defined in §SRS-3. Each transition:
- Validates the transition is allowed from the current state
- Records the transition in the history table
- Updates the technician status accordingly
- Triggers relevant notifications (§BRD BR-501)
- Updates the dispatch board in real time

**Acceptance Criteria:**
1. Valid transitions succeed and update all dependent data
2. Invalid transitions return a descriptive error
3. Real-time update propagates to all connected dispatch board clients within 1 second

**FR-104: Work Order Search and Filter** (traces to Persona: Dana)
The system must support searching and filtering work orders by:
- Status (multi-select)
- Priority
- Assigned technician
- Customer name or address
- Date range
- Service type

**Acceptance Criteria:**
1. Filters can be combined (AND logic)
2. Search is case-insensitive and supports partial matches
3. Results load within 500ms for up to 1000 work orders

### 2.2 Dispatch Board

**FR-200: Kanban Dispatch Board** (traces to §BRD BR-400, Persona: Dana)
The dispatch board displays work orders as cards in columns organized by status. The board supports:
- Columns: UNASSIGNED, ASSIGNED, EN_ROUTE, ON_SITE, IN_PROGRESS, COMPLETED
- Drag-and-drop between columns to change status
- Drag onto a technician avatar to assign
- Real-time updates (cards move automatically when status changes elsewhere)
- Date picker to view different days

**User Story:** As a dispatcher, I want a visual board showing all jobs by status so that I can manage the day's operations at a glance.

**Acceptance Criteria:**
1. Board renders all work orders for the selected date
2. Drag-and-drop triggers the appropriate state transition with validation
3. If a transition is invalid, the card snaps back to its original column with an error toast
4. Board updates in real time when other users or technicians change work order status
5. Board performs smoothly with 100+ cards (virtual scrolling within columns)

**FR-201: Dispatch Board — Technician Panel** (traces to §BRD BR-400, Persona: Dana)
The dispatch board includes a technician panel showing all technicians with:
- Name and avatar
- Current status (color-coded: green=available, blue=en_route, orange=on_job, gray=off_duty)
- Number of assigned jobs for the day
- Current location on the sidebar map

**Acceptance Criteria:**
1. All technicians for the company are listed
2. Status indicators update in real time
3. Clicking a technician filters the board to show only their work orders
4. Technician panel is collapsible on smaller screens

**FR-202: Split View — Map + Board** (traces to §BRD BR-401, Persona: Dana)
The dispatch dashboard presents a split view: live map on the left, Kanban board on the right. The split is resizable. Clicking a work order card highlights its marker on the map. Clicking a map marker highlights the corresponding card.

**Acceptance Criteria:**
1. Map and board render side by side on desktop (min-width: 1024px)
2. Map markers correspond to work order locations and technician positions
3. Clicking a card pans and zooms the map to the work order location
4. Clicking a map marker scrolls the board to the corresponding card
5. On tablet/mobile, map and board are in separate tabs

### 2.3 Route Optimization

**FR-300: Optimize Technician Route** (traces to §BRD BR-403, Persona: Dana)
The system must allow dispatchers to optimize a technician's daily route. The optimization reorders the technician's assigned jobs to minimize total drive time using the OpenRouteService Optimization API.

**User Story:** As a dispatcher, I want to optimize a technician's daily route so they spend less time driving and can complete more jobs.

**Acceptance Criteria:**
1. Dispatcher selects a technician and clicks "Optimize Route"
2. System sends the technician's jobs to the optimization API with the technician's starting location
3. Optimized order is displayed as a before/after comparison with estimated time savings
4. Dispatcher confirms or reverts the optimization
5. Optimized route is drawn on the map
6. If the API is unavailable, a user-friendly error message is shown

**FR-301: Route Visualization** (traces to §BRD BR-401)
Optimized routes are displayed on the map as polylines connecting the technician's job locations in visit order. Each segment shows estimated drive time.

**Acceptance Criteria:**
1. Route polyline renders on the Leaflet map with distinct color per technician
2. Hovering a segment shows drive time and distance
3. Route updates when jobs are added, removed, or reordered

### 2.4 GPS Tracking

**FR-400: Technician GPS Streaming** (traces to §BRD BR-303, BR-401, Persona: Dana)
The technician's browser streams GPS positions to the server via WebSocket at a configurable interval (default: 10 seconds). Positions are stored and broadcast to the dispatch dashboard and customer portal.

**User Story:** As a dispatcher, I want to see where all my technicians are in real time so I can make informed dispatch decisions.

**Acceptance Criteria:**
1. Technician's browser requests geolocation permission on login
2. Positions stream via WebSocket in the format: `{ lat, lng, accuracy, timestamp, heading, speed }`
3. Server stores positions in the database with technician ID and company ID
4. Server broadcasts positions to all connected dashboard clients for the same company
5. GPS streaming stops when the technician goes off-duty or closes the app
6. Battery-conscious: frequency reduces to 30s when stationary (speed < 1 m/s)

**FR-401: Live Map Markers** (traces to §BRD BR-401, Persona: Dana)
The dispatch dashboard map displays technician positions as animated markers with:
- Directional icon (showing heading)
- Name label
- Status color coding
- Smooth animation between position updates (interpolation)
- Accuracy circle (when accuracy > 50m)

**Acceptance Criteria:**
1. Markers update within 2 seconds of position broadcast
2. Animation smoothly transitions between positions (no jumping)
3. Clicking a marker shows technician name, status, current job, and last update time
4. Stale markers (no update > 60s) show a "last seen" indicator

**FR-402: Simulated GPS for Demos** (traces to §BRD BR-303)
The system must support a simulated GPS mode where technician positions are interpolated along a cached route. This enables demos without physical movement.

**User Story:** As a sales rep, I want to demonstrate live GPS tracking in a meeting room without needing a technician actually driving.

**Acceptance Criteria:**
1. Admin can enable "simulation mode" for a technician
2. System generates positions along the technician's active route at realistic speeds (30-50 km/h)
3. Simulated positions are indistinguishable from real positions on the map
4. Simulation stops when the technician "arrives" at the destination

### 2.5 Customer Portal

**FR-500: Customer Tracking Page** (traces to §BRD BR-500, Persona: Carol)
When a work order transitions to EN_ROUTE, the system generates a unique tracking URL and sends it to the customer. The tracking page shows:
- Technician name and photo
- Live map with technician position and route to customer
- Estimated arrival time (updates in real time)
- Work order details (service type, scheduled window)
- Company branding (logo, phone number)

**User Story:** As a customer, I want to see where my technician is and when they will arrive so I can plan my day.

**Acceptance Criteria:**
1. Tracking URL is unique per work order and expires 24 hours after job completion
2. Page loads without login (public, but URL is unguessable — UUID-based)
3. Map shows technician marker moving in real time
4. ETA updates every 30 seconds based on current position and traffic
5. Page shows "Technician has arrived" when work order transitions to ON_SITE
6. Page is mobile-responsive (most customers access on their phone)

**FR-501: Customer Work Order History** (traces to §BRD BR-502, Persona: Carol)
Authenticated customers can view their work order history, upcoming appointments, and invoices.

**Acceptance Criteria:**
1. Customer authenticates via magic link (email)
2. Dashboard shows upcoming and past work orders
3. Each work order shows status, date, service type, and technician name
4. Invoice links open the Stripe hosted invoice page

### 2.6 Technician Mobile UI

**FR-600: Technician Job List** (traces to Persona: Tyler)
The technician mobile UI shows today's assigned jobs in optimized visit order with:
- Customer name and address
- Service type and priority indicator
- Scheduled time window
- Status badge
- Navigation button (opens device maps app)

**User Story:** As a technician, I want to see my daily job list on my phone so I know where to go and what to do.

**Acceptance Criteria:**
1. Jobs are listed in route-optimized order
2. Current/next job is highlighted prominently
3. "Navigate" button opens the device's default maps app with the job address
4. Pull-to-refresh updates the job list
5. Large touch targets (minimum 44px) for use with gloves

**FR-601: Technician Status Updates** (traces to §BRD BR-200, Persona: Tyler)
The technician can update work order status with large, clear buttons:
- "Start Driving" (ASSIGNED -> EN_ROUTE)
- "Arrived" (EN_ROUTE -> ON_SITE)
- "Start Work" (ON_SITE -> IN_PROGRESS)
- "Complete Job" (IN_PROGRESS -> COMPLETED)

**Acceptance Criteria:**
1. Only the valid next transition button is shown (not all four)
2. Button press triggers state transition with optimistic UI update
3. If transition fails, button resets with error toast
4. GPS position is recorded with each status change

**FR-602: Photo and Notes Capture** (traces to Persona: Tyler)
Technicians can attach photos and notes to a work order.

**Acceptance Criteria:**
1. Camera capture uses the device camera (not file picker)
2. Photos are uploaded to object storage and linked to the work order
3. Photos display as thumbnails with the ability to zoom
4. Notes field supports up to 5000 characters
5. Photos and notes are timestamped and associated with the technician

### 2.7 Invoicing

**FR-700: Auto-Generate Invoice** (traces to §BRD BR-600, Persona: Dana, Alex)
When a work order is completed, the system automatically generates a draft invoice with:
- Customer information
- Work order reference number
- Line items from the work order (labor, materials, fees)
- Tax calculation (configurable tax rate per company)
- Total amount due

**Acceptance Criteria:**
1. Invoice is created within 5 seconds of work order completion
2. All line items match the work order
3. Tax is calculated correctly based on company settings
4. Invoice is in DRAFT status, allowing edits before sending

**FR-701: Send Invoice** (traces to §BRD BR-601, Persona: Dana)
Dispatchers or admins can review and send invoices. Sending creates a Stripe Invoice and emails the customer a payment link.

**Acceptance Criteria:**
1. "Send Invoice" button is available on draft invoices
2. Invoice is created in Stripe with correct line items
3. Customer receives an email with a link to the Stripe payment page
4. Work order transitions to INVOICED state
5. Invoice cannot be edited after sending

**FR-702: Payment Tracking** (traces to §BRD BR-601, Persona: Alex)
Payment events from Stripe webhooks update the invoice and work order status.

**Acceptance Criteria:**
1. Successful payment transitions the work order to PAID
2. Failed payment attempts are logged but do not change state
3. Invoice status is synced: DRAFT, SENT, PAID, VOID
4. Admin can manually mark an invoice as PAID (for cash/check payments)

### 2.8 Analytics

**FR-800: Operations Dashboard** (traces to §BRD BR-700, Persona: Alex)
The analytics dashboard displays:
- Jobs completed per day (bar chart, last 7/30 days)
- Average completion time by service type (bar chart)
- Technician utilization rate (percentage, per technician)
- Revenue collected (line chart, daily/weekly/monthly)
- Open vs completed jobs (donut chart)
- Average customer rating (if implemented)

**User Story:** As a company admin, I want to see operational metrics so I can identify bottlenecks and improve efficiency.

**Acceptance Criteria:**
1. All charts render with correct data within 2 seconds
2. Date range is selectable (7d, 30d, 90d, custom)
3. Data can be filtered by technician or service type
4. Dashboard auto-refreshes every 5 minutes

**FR-801: CSV Export** (traces to §BRD BR-701, Persona: Alex)
All analytics views support exporting the underlying data as CSV.

**Acceptance Criteria:**
1. "Export CSV" button is available on each analytics widget
2. CSV contains headers matching the displayed columns
3. Date range and filters are applied to the export
4. File downloads immediately (generated server-side)

### 2.9 Notifications

**FR-900: SMS Notifications** (traces to §BRD BR-501, Persona: Carol)
The system sends SMS notifications at the following events:
- Work order assigned to technician: "Your [service type] appointment with [company] is confirmed for [date/time]."
- Technician en route: "[Technician name] is on the way! Track arrival: [tracking URL]"
- Arriving in ~15 minutes: "[Technician name] will arrive in approximately 15 minutes."
- Arriving in ~5 minutes: "[Technician name] is almost there — arriving in about 5 minutes."

**Acceptance Criteria:**
1. SMS is sent within 30 seconds of the triggering event
2. Messages use configurable templates per company
3. Customer phone number is required; if missing, SMS is skipped and logged
4. ETA-based notifications (15 min, 5 min) trigger based on distance calculations, not fixed timers

**FR-901: Email Notifications** (traces to §BRD BR-501, Persona: Carol)
The system sends email notifications at:
- Work order created: Confirmation with details
- Job completed: Summary with invoice link
- Invoice sent: Payment link via Stripe

**Acceptance Criteria:**
1. Emails are sent via a transactional email service (e.g., Resend, SendGrid)
2. Emails include company branding (logo, colors)
3. Emails render correctly on mobile email clients
4. Unsubscribe link is included per CAN-SPAM

**FR-902: Push Notifications for Technicians** (traces to Persona: Tyler)
Technicians receive push notifications for:
- New job assigned
- Job reassigned or cancelled
- Schedule change
- Dispatch message from the office

**Acceptance Criteria:**
1. Notifications use the Web Push API (service worker)
2. Technician must opt-in to push notifications
3. Notification includes job summary and tap-to-open action
4. If push is unavailable, fallback to SMS

## 3. Non-Functional Requirements (Product Level)

**NFR-P1: Page Load Time**
All pages must achieve First Contentful Paint < 1.5 seconds on a 4G connection.

**NFR-P2: Accessibility**
The application must meet WCAG 2.1 Level AA standards. All interactive elements must be keyboard accessible. Color is not the sole indicator of status.

**NFR-P3: Responsive Design**
- Desktop dispatch (>= 1024px): Split view with map and Kanban board
- Tablet (768px - 1023px): Tabbed view (map tab, board tab)
- Mobile (<768px): Stacked view optimized for technician use

**NFR-P4: Offline Resilience**
If WebSocket connection is lost, the application must:
1. Display a "reconnecting" banner
2. Queue local actions (status updates, notes)
3. Replay queued actions on reconnection
4. Fall back to polling for critical data (work order list)

## 4. Traceability Matrix

| FR | Traces to BR/Persona | Feature Area |
|----|----------------------|-------------|
| FR-100 | BR-200, BR-204, Dana | Work Order |
| FR-101 | BR-200, BR-205, Dana | Work Order |
| FR-102 | BR-202, Dana, Tyler | Work Order |
| FR-103 | BR-200, BR-202, BR-501 | Work Order |
| FR-104 | Dana | Work Order |
| FR-200 | BR-400, Dana | Dispatch |
| FR-201 | BR-400, Dana | Dispatch |
| FR-202 | BR-401, Dana | Dispatch |
| FR-300 | BR-403, Dana | Route Optimization |
| FR-301 | BR-401 | Route Optimization |
| FR-400 | BR-303, BR-401, Dana | GPS Tracking |
| FR-401 | BR-401, Dana | GPS Tracking |
| FR-402 | BR-303 | GPS Tracking |
| FR-500 | BR-500, Carol | Customer Portal |
| FR-501 | BR-502, Carol | Customer Portal |
| FR-600 | Tyler | Technician UI |
| FR-601 | BR-200, Tyler | Technician UI |
| FR-602 | Tyler | Technician UI |
| FR-700 | BR-600, Dana, Alex | Invoicing |
| FR-701 | BR-601, Dana | Invoicing |
| FR-702 | BR-601, Alex | Invoicing |
| FR-800 | BR-700, Alex | Analytics |
| FR-801 | BR-701, Alex | Analytics |
| FR-900 | BR-501, Carol | Notifications |
| FR-901 | BR-501, Carol | Notifications |
| FR-902 | Tyler | Notifications |

## 5. Cross-References

- Product vision and personas: §PVD
- Business requirements: §BRD
- Architecture: §SRS-1
- Data model: §SRS-2
- Domain logic: §SRS-3
- Security and communications: §SRS-4
- UI wireframes: §WIREFRAMES

---

*End of Product Requirements Document*
