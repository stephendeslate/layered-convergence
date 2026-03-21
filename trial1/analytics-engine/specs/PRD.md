# Product Requirements Document (PRD)

## Analytics Engine — Embeddable Multi-Tenant Analytics Platform

| Field          | Value                          |
|----------------|--------------------------------|
| Version        | 1.0                            |
| Date           | 2026-03-20                     |
| Status         | Draft                          |
| Owner          | Product Team                   |
| Classification | Internal                       |

---

## 1. Data Sources Module

### FR-001: Data Source CRUD

**Traces to:** BR-020, BR-021, BR-022, BR-024, Persona: Platform Admin

The system MUST allow Platform Admins to create, read, update, and delete data sources.

**User Story:** As a Platform Admin, I want to configure a new data source so that I can ingest external data into my analytics dashboards.

**Acceptance Criteria:**
1. Admin can select a connector type (REST API, PostgreSQL, CSV, Webhook) from a dropdown.
2. A configuration form renders dynamically based on the selected connector type.
3. Connection credentials are encrypted before storage (§SRS-4).
4. "Test Connection" button verifies connectivity and returns success/failure within 10 seconds.
5. Data source creation is blocked if the tenant has reached their tier limit (§BRD BR-024).
6. Data source list view shows name, connector type, last sync status, and next scheduled sync.

### FR-002: REST API Connector Configuration

**Traces to:** BR-020, BR-023, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to connect to a REST API so that I can pull data from external services.

**Acceptance Criteria:**
1. Admin provides: endpoint URL, HTTP method (GET/POST), headers (key-value pairs), query parameters, authentication (none/API key/Bearer token/Basic auth).
2. Admin configures a JSON path to extract the data array from the response (e.g., `$.data.records`).
3. Admin can set pagination strategy: none, cursor-based, offset-based, link-header.
4. System performs a test request and displays the response structure for field mapping.

### FR-003: PostgreSQL Connector Configuration

**Traces to:** BR-020, BR-023, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to connect to a PostgreSQL database so that I can query analytics data from my production or replica database.

**Acceptance Criteria:**
1. Admin provides: host, port, database name, username, password, SSL mode (disable/require/verify-full).
2. Admin writes a SQL query that defines the data to sync. The system validates SQL syntax before saving.
3. System executes a test query (with `LIMIT 10`) and displays sample rows for field mapping.
4. Connections use a read-only database user recommendation in the UI.

### FR-004: CSV Connector Configuration

**Traces to:** BR-033, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to upload a CSV file so that I can quickly visualize static data.

**Acceptance Criteria:**
1. Admin uploads a CSV file via a file picker. Size limits enforced per tier (§BRD BR-033).
2. System auto-detects delimiter (comma, semicolon, tab) and encoding (UTF-8, Latin-1).
3. System displays the first 10 rows as a preview with detected column names and inferred types (string, number, date).
4. Admin can re-upload to replace data. Previous data points are deleted on replacement.

### FR-005: Webhook Connector Configuration

**Traces to:** BR-014, BR-032, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to receive data via webhooks so that external systems can push events to my analytics in real time.

**Acceptance Criteria:**
1. System generates a unique webhook URL per data source (e.g., `https://api.example.com/webhooks/:sourceId/:secret`).
2. Admin configures an optional HMAC signature header name and secret for payload verification.
3. Admin defines the expected JSON schema (field names and types).
4. Incoming payloads are validated against the schema. Invalid payloads are written to the dead letter queue (§BRD BR-034).
5. Rate limits are enforced per tier (§BRD BR-014).

### FR-006: Field Mapping

**Traces to:** BR-030, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to map source fields to standardized dimensions and metrics so that my widgets can query data consistently.

**Acceptance Criteria:**
1. System displays source fields (auto-detected from test connection) in a left column.
2. Admin maps each source field to a target field name, selecting a data type (string, number, date, boolean).
3. Admin designates each field as a "dimension" (for grouping/filtering) or "metric" (for aggregation).
4. Admin can add transform steps: rename, type cast, default value, date format parse.
5. At least one dimension and one metric MUST be mapped before saving.

---

## 2. Ingestion Pipeline Module

### FR-007: Sync Scheduling

**Traces to:** BR-023, BR-031, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to schedule automatic syncs so that my dashboard data stays fresh without manual intervention.

**Acceptance Criteria:**
1. Admin selects a sync schedule: manual, every 15 minutes, hourly, daily, weekly.
2. Free tier is restricted to hourly minimum (§BRD BR-023 / tier table).
3. System enqueues BullMQ jobs at the configured interval.
4. Admin can trigger a manual sync at any time regardless of schedule.
5. If 3 consecutive syncs fail, automatic scheduling is paused and an email alert is sent (§BRD BR-031).

### FR-008: Transform Engine

**Traces to:** Persona: Platform Admin

**User Story:** As a Platform Admin, I want to apply transforms to incoming data so that it matches my dashboard requirements.

**Acceptance Criteria:**
1. Transforms are applied in order after field mapping and before data storage.
2. Supported transforms: rename field, cast type (string→number, string→date), set default value, date format parsing (ISO 8601, Unix timestamp, custom format string).
3. Transform errors on individual records write the record to the dead letter queue; the sync continues for remaining records.
4. Transform configuration is stored as a JSON array on the DataSourceConfig.

### FR-009: Sync Run Tracking

**Traces to:** BR-007, BR-034, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to see the history of sync runs so that I can diagnose data freshness issues.

**Acceptance Criteria:**
1. Sync history page displays a table: start time, end time, status (running/completed/failed), rows synced, rows failed, error message.
2. Table is sortable by start time (default: newest first) and filterable by status.
3. Clicking a failed sync shows the error details and links to related dead letter events.
4. Running syncs show a progress indicator (rows processed so far).

---

## 3. Dashboard Builder Module

### FR-010: Dashboard CRUD

**Traces to:** BR-025, BR-026, BR-027, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to create and manage dashboards so that I can organize widgets for my end users.

**Acceptance Criteria:**
1. Admin creates a dashboard with a name and optional description.
2. Dashboard status lifecycle: draft → published → archived (§SRS-3 state machine).
3. Published dashboards are read-only. Admin must revert to draft to edit (§BRD BR-026).
4. Archived dashboards are hidden from the embed API (§BRD BR-027).
5. Dashboard list shows name, status, widget count, last modified date, and embed status.
6. Dashboard creation is blocked at tier limits (§BRD BR-025).

### FR-011: Dashboard Layout (CSS Grid)

**Traces to:** Persona: Platform Admin

**User Story:** As a Platform Admin, I want to arrange widgets on a grid so that the dashboard layout is clean and organized.

**Acceptance Criteria:**
1. Dashboard uses a 12-column CSS Grid layout.
2. Each widget has a configurable column span (1-12) and row span (1-4).
3. Widgets are positioned by specifying column start and row start (not drag-and-drop).
4. Admin selects layout via dropdown menus for column span, row span, column position, and row position.
5. A live preview shows the current layout as the admin configures it.
6. Responsive behavior: widgets stack vertically on screens narrower than 768px.

### FR-012: Widget Palette

**Traces to:** BR-028, BR-029, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to add widgets to my dashboard from a palette of chart types.

**Acceptance Criteria:**
1. Widget palette displays all 7 types: Line, Bar, Pie/Donut, Area, KPI Card, Table, Funnel.
2. Each type shows a thumbnail preview and a brief description.
3. Clicking a type opens the widget configuration panel (§FR-013).
4. Maximum 20 widgets per dashboard (§BRD BR-028).

---

## 4. Widget Engine Module

### FR-013: Widget Configuration

**Traces to:** BR-029, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to configure a widget by selecting a data source, dimensions, metrics, and styling options.

**Acceptance Criteria:**
1. Admin selects a data source from a dropdown (only the tenant's data sources are listed).
2. Admin selects a dimension field (X axis / category) from the data source's mapped fields.
3. Admin selects one or more metric fields (Y axis / values) with an aggregation function (sum, avg, count, min, max).
4. Admin configures a date range filter: last 7/30/90 days, custom range, or "all time."
5. Admin configures grouping period: none, hourly, daily, weekly, monthly.
6. Admin sets a widget title and optional subtitle.
7. Live preview renders the chart as the admin configures it.

### FR-014 through FR-020: Chart Type Specifications

**Traces to:** Persona: End User

All chart types share these common requirements: tooltips on hover showing exact values, animated transitions (300ms ease-in-out) when data updates via SSE, and responsive sizing within the widget container.

| FR | Type | Key Acceptance Criteria |
|----|------|------------------------|
| FR-014 | **Line** | Time on X axis, metric values on Y axis. Multiple series supported (one line per metric or per dimension value). Configurable curve type (monotone, linear). |
| FR-015 | **Bar** | Vertical bars grouped by dimension. Supports stacked and grouped modes (configurable). |
| FR-016 | **Pie/Donut** | Configurable inner radius (0 for pie, 60 for donut). Segments represent dimension values. Labels show percentage and absolute value. Max 10 segments; overflow grouped into "Other." |
| FR-017 | **Area** | Filled area chart with time on X axis. Supports stacked mode. Gradient fill from series color to transparent. |
| FR-018 | **KPI Card** | Single large number (aggregated metric). Comparison to previous period with green/red indicator. Optional sparkline. Configurable prefix/suffix (e.g., "$", "%"). |
| FR-019 | **Table** | Sortable columns (click header). Pagination: 10/25/50 rows per page. Numeric columns right-aligned. Virtualized rendering for >100 rows. |
| FR-020 | **Funnel** | Horizontal funnel with decreasing stage widths. Each stage shows label, value, and conversion % from previous stage. Min 2, max 10 stages. |

---

## 5. Embed System Module

### FR-021: Embed Code Generation

**Traces to:** BR-015, BR-016, BR-018, BR-019, Persona: Developer

**User Story:** As a Developer, I want to get an embed code snippet so that I can add the analytics dashboard to my product.

**Acceptance Criteria:**
1. Admin navigates to a published dashboard's embed settings.
2. System generates an iframe embed code: `<iframe src="https://embed.example.com/d/:dashboardId?key=:apiKey" width="100%" height="600"></iframe>`.
3. Admin configures allowed origins (comma-separated list of domains).
4. Embed preview shows the dashboard exactly as end users will see it.
5. "Copy to clipboard" button for the embed code.
6. System also generates a JavaScript snippet alternative for dynamic embedding.

### FR-022: Embed Rendering

**Traces to:** BR-015, BR-018, BR-038, Persona: End User

**User Story:** As an End User, I want to view an embedded analytics dashboard that matches the host application's branding.

**Acceptance Criteria:**
1. Embedded dashboard loads within 2 seconds (P95).
2. Dashboard renders with the tenant's theme (colors, fonts, logo, corner radius).
3. Free tier embeds display a "Powered by Analytics Engine" badge in the bottom-right corner.
4. Dashboard is responsive: grid layout adapts to the iframe's width.
5. Widgets display loading skeletons while data is being fetched.

### FR-023: postMessage API

**Traces to:** Persona: Developer

**User Story:** As a Developer, I want to communicate with the embedded dashboard via postMessage so that I can dynamically filter data or respond to user interactions.

**Acceptance Criteria:**
1. Host page can send messages to the iframe: `{ type: 'setFilter', payload: { field: 'region', value: 'US' } }`.
2. Iframe responds with acknowledgment: `{ type: 'filterApplied', payload: { field: 'region', value: 'US' } }`.
3. Iframe sends events to host: `{ type: 'widgetClick', payload: { widgetId, dataPoint } }`.
4. All messages are validated against a schema. Invalid messages are silently ignored.
5. Messages are only accepted from the configured allowed origins.

---

## 6. Theme Engine Module

### FR-024: Theme Configuration

**Traces to:** BR-038, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to customize the look and feel of embedded dashboards so that they match my product's branding.

**Acceptance Criteria:**
1. Admin configures: primary color, secondary color, background color, text color, font family (from a list of 10 web-safe + Google Fonts options), corner radius (0-16px), logo upload (PNG/SVG, max 500KB).
2. Live preview updates in real-time as the admin adjusts settings.
3. Theme applies to all published dashboards for that tenant.
4. Default theme is provided (neutral gray/blue palette) for tenants who don't customize.
5. Theme settings are stored on the Tenant model (§SRS-2).

### FR-025: Logo Management

**Traces to:** Persona: Platform Admin

**Acceptance Criteria:**
1. Admin uploads a logo image (PNG or SVG, max 500KB).
2. Logo is displayed in the top-left corner of embedded dashboards.
3. Admin can remove the logo to revert to text-only header.
4. Logo is resized to fit within 40px height, maintaining aspect ratio.

---

## 7. Admin Portal Module

### FR-026: Tenant Registration and Login

**Traces to:** Persona: Platform Admin

**User Story:** As a Platform Admin, I want to register and log in so that I can manage my analytics configuration.

**Acceptance Criteria:**
1. Registration form: email, password (min 8 chars, 1 uppercase, 1 number), organization name.
2. Email verification via a magic link (valid for 24 hours).
3. Login via email + password. JWT issued with 24-hour expiry.
4. Password reset via email link (valid for 1 hour).
5. Session persists across page reloads via httpOnly secure cookie.

### FR-027: Admin Dashboard (Home Page)

**Traces to:** BR-048, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to see an overview of my analytics setup when I log in.

**Acceptance Criteria:**
1. Home page displays: number of data sources (with status indicators), number of dashboards (with status badges), recent sync activity (last 5 runs), usage against tier limits.
2. Quick action buttons: "Add Data Source", "Create Dashboard", "View Embed Code."
3. Alert banner if any data source has a paused sync (due to consecutive failures).

### FR-028: API Key Management

**Traces to:** BR-017, BR-019, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to manage my API keys so that I can rotate them without downtime.

**Acceptance Criteria:**
1. Admin can generate a new embed API key. The full key is shown once; after that, only the last 4 characters are displayed.
2. System supports up to 2 active embed API keys simultaneously.
3. Admin can revoke any API key. Revocation takes effect within 60 seconds (cache TTL).
4. Admin API keys (for admin portal access) are separate from embed API keys.

### FR-029: Usage and Billing

**Traces to:** BR-035, BR-036, BR-037, BR-048, Persona: Platform Admin

**User Story:** As a Platform Admin, I want to view my current usage and manage my subscription so that I can upgrade when needed.

**Acceptance Criteria:**
1. Usage page shows: dashboards used / limit, data sources used / limit, API calls this month, data points stored.
2. "Upgrade" button redirects to Stripe Checkout for tier upgrade.
3. "Manage Subscription" links to Stripe Customer Portal for cancellation/downgrade.
4. After a tier change, limits update immediately without requiring re-login (§BRD BR-036).

---

## 8. Real-Time Updates Module

### FR-030: SSE Connection

**Traces to:** Persona: End User, Developer

**User Story:** As an End User, I want my embedded dashboard to update automatically when new data is available.

**Acceptance Criteria:**
1. Embedded dashboard establishes an SSE connection on load: `GET /api/sse/:dashboardId?key=:apiKey`.
2. SSE connection authenticated via embed API key.
3. Connection auto-reconnects on disconnect with exponential backoff (1s, 2s, 4s, max 30s).
4. Server sends heartbeat events every 30 seconds to keep the connection alive.

### FR-031: Real-Time Widget Updates

**Traces to:** Persona: End User

**Acceptance Criteria:**
1. When a sync run completes, the server publishes an event to the dashboard's SSE channel.
2. Event payload contains the updated widget data (not the full dashboard — only affected widgets).
3. Widgets re-render with animated transitions (300ms ease-in-out).
4. If the SSE connection is lost, widgets display a subtle "Live updates paused" indicator.

---

## 9. Traceability Matrix

| FR | Traces to BR(s) | Traces to Persona(s) |
|----|-----------------|----------------------|
| FR-001 | BR-020, BR-021, BR-022, BR-024 | Platform Admin |
| FR-002 | BR-020, BR-023 | Platform Admin |
| FR-003 | BR-020, BR-023 | Platform Admin |
| FR-004 | BR-033 | Platform Admin |
| FR-005 | BR-014, BR-032 | Platform Admin |
| FR-006 | BR-030 | Platform Admin |
| FR-007 | BR-023, BR-031 | Platform Admin |
| FR-008 | — | Platform Admin |
| FR-009 | BR-007, BR-034 | Platform Admin |
| FR-010 | BR-025, BR-026, BR-027 | Platform Admin |
| FR-011 | — | Platform Admin |
| FR-012 | BR-028, BR-029 | Platform Admin |
| FR-013 | BR-029 | Platform Admin |
| FR-014 to FR-020 | — (chart types are UX requirements) | End User |
| FR-021 | BR-015, BR-016, BR-018, BR-019 | Developer |
| FR-022 | BR-015, BR-018, BR-038 | End User |
| FR-023 | — | Developer |
| FR-024 | BR-038 | Platform Admin |
| FR-025 | — | Platform Admin |
| FR-026 | — | Platform Admin |
| FR-027 | BR-048 | Platform Admin |
| FR-028 | BR-017, BR-019 | Platform Admin |
| FR-029 | BR-035, BR-036, BR-037, BR-048 | Platform Admin |
| FR-030 | — | End User, Developer |
| FR-031 | — | End User |

---

## 10. Document References

| Document | Section | Relationship |
|----------|---------|-------------|
| §PVD | Personas | FR acceptance criteria trace to persona goals |
| §BRD | Business Rules | Every FR traces to BRs or personas |
| §SRS-1 | Architecture | Implementation architecture for all modules |
| §SRS-2 | Data Model | Schema supports all FR data requirements |
| §SRS-3 | Domain Logic | Algorithms and state machines implement FR behaviors |
| §SRS-4 | Security | Auth and security implement embed and admin FR |
| §WIREFRAMES | UI Layouts | Visual representation of FR user-facing behavior |
