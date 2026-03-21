# Wireframes

## Analytics Engine — Embeddable Multi-Tenant Analytics Platform

| Field          | Value                          |
|----------------|--------------------------------|
| Version        | 1.0                            |
| Date           | 2026-03-20                     |
| Status         | Draft                          |
| Owner          | Design Team                    |
| Classification | Internal                       |

---

## 1. Tenant Admin Dashboard (Home Page)

**Route:** `/dashboard`
**Reference:** §PRD FR-027

### Desktop (>1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                          [+ Data Source] [+ Dashboard]│
│ │  LOGO   │  Analytics Engine       Admin Portal             user@co.com ▼ │
│ └─────────┘                                                                │
├───────────────┬─────────────────────────────────────────────────────────────┤
│               │                                                             │
│  Dashboard    │  Welcome back, Acme Corp                                    │
│  ─────────    │                                                             │
│  > Overview   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  > Data       │  │ Data Sources │ │  Dashboards  │ │  Sync Runs   │        │
│    Sources    │  │              │ │              │ │  (24h)       │        │
│  > Dashboards │  │     1 / 1    │ │    1 / 1     │ │   12 / 12    │        │
│  > Sync       │  │   ████████  │ │   ████████   │ │  ✓ All pass  │        │
│    History    │  └──────────────┘ └──────────────┘ └──────────────┘        │
│               │                                                             │
│  Settings     │  ⚠ Alert: Sync paused for "Sales API" — 3 consecutive     │
│  ─────────    │    failures. [Review] [Resume]                              │
│  > Theme      │                                                             │
│  > API Keys   │  Recent Sync Activity                                       │
│  > Billing    │  ┌────────────────────────────────────────────────────────┐ │
│               │  │ Data Source     │ Status    │ Rows  │ Time            │ │
│               │  ├─────────────────┼───────────┼───────┼─────────────────┤ │
│               │  │ Sales API       │ ✓ Done    │ 1,204 │ 5 min ago       │ │
│               │  │ Sales API       │ ✓ Done    │ 1,198 │ 1 hour ago      │ │
│               │  │ User Events     │ ✓ Done    │   892 │ 2 hours ago     │ │
│               │  │ Sales API       │ ✗ Failed  │     0 │ 3 hours ago     │ │
│               │  │ User Events     │ ✓ Done    │   876 │ 4 hours ago     │ │
│               │  └────────────────────────────────────────────────────────┘ │
│               │                                                             │
│               │  Quick Actions                                              │
│               │  [+ Add Data Source]  [+ Create Dashboard]  [View Embed]    │
│               │                                                             │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
AdminLayout
├── Sidebar
│   ├── Logo
│   ├── NavSection "Dashboard"
│   │   ├── NavItem "Overview" (active)
│   │   ├── NavItem "Data Sources"
│   │   ├── NavItem "Dashboards"
│   │   └── NavItem "Sync History"
│   └── NavSection "Settings"
│       ├── NavItem "Theme"
│       ├── NavItem "API Keys"
│       └── NavItem "Billing"
├── TopBar
│   ├── QuickActionButtons
│   └── UserMenu (dropdown)
└── MainContent
    ├── WelcomeHeader
    ├── UsageCards (3x grid)
    │   ├── DataSourceUsageCard
    │   ├── DashboardUsageCard
    │   └── SyncRunCard
    ├── AlertBanner (conditional)
    ├── RecentSyncTable
    └── QuickActions
```

### Mobile (<768px)

```
┌──────────────────────────────┐
│ ☰  Analytics Engine    ⚙    │
├──────────────────────────────┤
│ Welcome back, Acme Corp      │
│                              │
│ ┌────────────────────────┐   │
│ │ Data Sources   1 / 1   │   │
│ │ ████████████████████   │   │
│ └────────────────────────┘   │
│ ┌────────────────────────┐   │
│ │ Dashboards     1 / 1   │   │
│ │ ████████████████████   │   │
│ └────────────────────────┘   │
│ ┌────────────────────────┐   │
│ │ Sync Runs (24h)        │   │
│ │ 12/12  ✓ All pass      │   │
│ └────────────────────────┘   │
│                              │
│ ⚠ Sync paused: Sales API    │
│   [Review] [Resume]         │
│                              │
│ Recent Syncs                 │
│ ┌────────────────────────┐   │
│ │ Sales API  ✓  1,204    │   │
│ │ 5 min ago              │   │
│ ├────────────────────────┤   │
│ │ Sales API  ✓  1,198    │   │
│ │ 1 hour ago             │   │
│ └────────────────────────┘   │
│                              │
│ [+ Data Source] [+ Dashboard]│
└──────────────────────────────┘
```

---

## 2. Data Source Configuration Wizard

**Route:** `/data-sources/new`
**Reference:** §PRD FR-001 through FR-006

### Step 1: Connector Type Selection

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Data Sources         New Data Source                    Step 1/4│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Choose a connector type                                                    │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                                │
│  │    ┌──┐          │  │    ┌──┐          │                                │
│  │    │{}│          │  │    │DB│          │                                │
│  │    └──┘          │  │    └──┘          │                                │
│  │   REST API       │  │   PostgreSQL     │                                │
│  │   Poll a REST    │  │   Query a        │                                │
│  │   endpoint on    │  │   PostgreSQL     │                                │
│  │   a schedule     │  │   database       │                                │
│  │                  │  │                  │                                │
│  │  [Select]        │  │  [Select]        │                                │
│  └──────────────────┘  └──────────────────┘                                │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                                │
│  │    ┌──┐          │  │    ┌──┐          │                                │
│  │    │Fl│          │  │    │>>│          │                                │
│  │    └──┘          │  │    └──┘          │                                │
│  │   CSV Upload     │  │   Webhook        │                                │
│  │   Upload a CSV   │  │   Receive push   │                                │
│  │   file with your │  │   events from    │                                │
│  │   data           │  │   external       │                                │
│  │                  │  │   systems        │                                │
│  │  [Select]        │  │  [Select]        │                                │
│  └──────────────────┘  └──────────────────┘                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 2: Connection Details (REST API example)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back                    REST API Configuration                  Step 2/4│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Data Source Name                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Sales API                                                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  Endpoint URL                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ https://api.example.com/v1/sales                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  HTTP Method    ┌──────────┐                                                │
│                 │ GET    ▼ │                                                │
│                 └──────────┘                                                │
│                                                                             │
│  Authentication ┌──────────────┐                                            │
│                 │ Bearer Token▼│                                            │
│                 └──────────────┘                                            │
│                                                                             │
│  Bearer Token                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ sk_live_xxxxxxxxxxxxxxxxxxxxx                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  Headers (optional)                                                         │
│  ┌──────────────────────┐  ┌────────────────────────────────┐  [+ Add]     │
│  │ X-Custom-Header      │  │ custom-value                   │              │
│  └──────────────────────┘  └────────────────────────────────┘              │
│                                                                             │
│  JSON Path to Data Array                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ $.data.records                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  Pagination     ┌──────────────┐                                            │
│                 │ Cursor-based▼│                                            │
│                 └──────────────┘                                            │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │ [Test Connection]                               [Cancel] [Next] │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ✓ Connection successful — 247 records found                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 3: Field Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back                    Field Mapping                           Step 3/4│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Map source fields to your analytics schema. Mark each as a dimension       │
│  (for grouping) or metric (for aggregation).                                │
│                                                                             │
│  ┌────────────────┬────────────────┬──────────┬───────────┬──────────────┐  │
│  │ Source Field    │ Target Name    │ Type     │ Role      │ Required     │  │
│  ├────────────────┼────────────────┼──────────┼───────────┼──────────────┤  │
│  │ region         │ region       ▼ │ String ▼ │ Dimension▼│ [✓]          │  │
│  ├────────────────┼────────────────┼──────────┼───────────┼──────────────┤  │
│  │ product_name   │ product      ▼ │ String ▼ │ Dimension▼│ [✓]          │  │
│  ├────────────────┼────────────────┼──────────┼───────────┼──────────────┤  │
│  │ revenue_usd    │ revenue      ▼ │ Number ▼ │ Metric  ▼ │ [✓]          │  │
│  ├────────────────┼────────────────┼──────────┼───────────┼──────────────┤  │
│  │ order_count    │ orders       ▼ │ Number ▼ │ Metric  ▼ │ [ ]          │  │
│  ├────────────────┼────────────────┼──────────┼───────────┼──────────────┤  │
│  │ created_at     │ date         ▼ │ Date   ▼ │ Dimension▼│ [✓]          │  │
│  └────────────────┴────────────────┴──────────┴───────────┴──────────────┘  │
│                                                                             │
│  Transforms (optional)                                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 1. Date Format: "date" → YYYY-MM-DD                           [×]  │   │
│  │ 2. Rename: "product_name" → "product"                         [×]  │   │
│  │                                                         [+ Add]     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Sample Data Preview                                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ region │ product    │ revenue │ orders │ date       │                │   │
│  ├────────┼────────────┼─────────┼────────┼────────────┤                │   │
│  │ US     │ Widget A   │   1,500 │     42 │ 2026-03-15 │                │   │
│  │ EU     │ Widget B   │   2,300 │     67 │ 2026-03-15 │                │   │
│  │ US     │ Widget A   │   1,800 │     51 │ 2026-03-16 │                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                                    [Cancel] [Back] [Next]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 4: Sync Schedule

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back                    Sync Schedule                           Step 4/4│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  How often should we sync data from this source?                            │
│                                                                             │
│  ┌──────────────────────────┐                                              │
│  │ ○ Manual only            │                                              │
│  │ ○ Every 15 minutes  [PRO]│                                              │
│  │ ● Hourly                 │                                              │
│  │ ○ Daily                  │                                              │
│  │ ○ Weekly                 │                                              │
│  └──────────────────────────┘                                              │
│                                                                             │
│  Note: Hourly is the minimum frequency for the Free plan.                   │
│  Upgrade to Pro for 15-minute syncs.                                        │
│                                                                             │
│  Summary                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Name:        Sales API                                              │   │
│  │ Connector:   REST API                                               │   │
│  │ Endpoint:    https://api.example.com/v1/sales                       │   │
│  │ Fields:      5 mapped (3 dimensions, 2 metrics)                     │   │
│  │ Transforms:  2 configured                                           │   │
│  │ Schedule:    Hourly                                                  │   │
│  │ First sync:  Immediately after saving                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                             [Cancel] [Back] [Save & Sync]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
DataSourceWizard
├── WizardStepper (Step 1/4, 2/4, 3/4, 4/4)
├── Step1_ConnectorTypeSelection
│   └── ConnectorCard (x4: REST API, PostgreSQL, CSV, Webhook)
├── Step2_ConnectionDetails
│   ├── NameInput
│   ├── ConnectorSpecificForm
│   │   ├── RestApiForm (url, method, auth, headers, jsonPath, pagination)
│   │   ├── PostgresqlForm (host, port, database, username, password, ssl, query)
│   │   ├── CsvForm (file upload, delimiter, encoding)
│   │   └── WebhookForm (generated URL, signature config, schema)
│   └── TestConnectionButton
├── Step3_FieldMapping
│   ├── FieldMappingTable
│   │   └── FieldMappingRow (sourceField, targetName, type, role, required)
│   ├── TransformList
│   │   └── TransformItem (type-specific config)
│   └── SampleDataPreview (table)
└── Step4_SyncSchedule
    ├── ScheduleRadioGroup
    ├── TierLimitNotice (conditional)
    └── ConfigSummary
```

---

## 3. Dashboard Builder

**Route:** `/dashboards/:id/builder`
**Reference:** §PRD FR-010, FR-011, FR-012

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Dashboards          Sales Analytics Dashboard         [Draft] [Publish] │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │                                                                │
│  Widget    │  Dashboard Canvas (12-column grid)                             │
│  Palette   │  ┌────────────────────────────┬────────────────────────────┐   │
│  ─────     │  │                            │                            │   │
│            │  │  Revenue Over Time         │  Revenue by Region          │   │
│  ┌──────┐  │  │  ┌───────────────────┐     │  ┌──────────────────┐      │   │
│  │ Line │  │  │  │    /\    /\       │     │  │     ████         │      │   │
│  └──────┘  │  │  │   /  \  /  \  /   │     │  │  ████████        │      │   │
│  ┌──────┐  │  │  │  /    \/    \/    │     │  │  ██████████      │      │   │
│  │ Bar  │  │  │  └───────────────────┘     │  │  ████████████    │      │   │
│  └──────┘  │  │  col 1-6, row 1-2          │  │                  │      │   │
│  ┌──────┐  │  │                            │  └──────────────────┘      │   │
│  │ Pie  │  │  │                            │  col 7-12, row 1-2         │   │
│  └──────┘  │  ├────────────────────────────┴────────────────────────────┤   │
│  ┌──────┐  │  │                                                         │   │
│  │ Area │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  └──────┘  │  │  │ $125.4K  │ │  3,847   │ │  $32.60  │ │  +12.3%  │   │   │
│  ┌──────┐  │  │  │ Revenue  │ │  Orders  │ │ Avg Order│ │  Growth  │   │   │
│  │ KPI  │  │  │  │ ▲ +8.2%  │ │ ▲ +5.1%  │ │ ▲ +2.9%  │ │ ▲ +1.4%  │   │   │
│  └──────┘  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  ┌──────┐  │  │  col 1-3       col 4-6      col 7-9      col 10-12     │   │
│  │Table │  │  │  row 3         row 3         row 3         row 3        │   │
│  └──────┘  │  │                                                         │   │
│  ┌──────┐  │  ├─────────────────────────────────────────────────────────┤   │
│  │Funnel│  │  │                                                         │   │
│  └──────┘  │  │  Sales Data Table                                       │   │
│            │  │  ┌─────────┬──────────┬─────────┬────────┬───────────┐  │   │
│            │  │  │ Region  │ Product  │ Revenue │ Orders │ Date      │  │   │
│            │  │  ├─────────┼──────────┼─────────┼────────┼───────────┤  │   │
│  ─────     │  │  │ US      │ Widget A │  $1,500 │     42 │ 2026-03-15│  │   │
│  [+ Add    │  │  │ EU      │ Widget B │  $2,300 │     67 │ 2026-03-15│  │   │
│   Widget]  │  │  │ US      │ Widget A │  $1,800 │     51 │ 2026-03-16│  │   │
│            │  │  └─────────┴──────────┴─────────┴────────┴───────────┘  │   │
│            │  │  col 1-12, row 4-5                                      │   │
│            │  │                                                         │   │
│            │  └─────────────────────────────────────────────────────────┘   │
│            │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
DashboardBuilder
├── BuilderTopBar
│   ├── BackButton
│   ├── DashboardTitle (editable)
│   ├── StatusBadge (Draft/Published/Archived)
│   └── PublishButton
├── WidgetPalette (left sidebar)
│   ├── WidgetTypeCard "Line"
│   ├── WidgetTypeCard "Bar"
│   ├── WidgetTypeCard "Pie/Donut"
│   ├── WidgetTypeCard "Area"
│   ├── WidgetTypeCard "KPI Card"
│   ├── WidgetTypeCard "Table"
│   ├── WidgetTypeCard "Funnel"
│   └── AddWidgetButton
└── DashboardCanvas
    ├── GridLayout (12 columns)
    └── WidgetCard (x N)
        ├── WidgetHeader (title, subtitle, edit/delete buttons)
        ├── ChartRenderer (type-specific)
        └── WidgetOverlay (on hover: edit, delete, resize controls)
```

---

## 4. Widget Configuration Panel

**Reference:** §PRD FR-013

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Configure Widget                                              [×] Close   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Chart Type        ┌──────────────┐                                        │
│                    │ Line Chart ▼ │                                        │
│                    └──────────────┘                                        │
│                                                                             │
│  Title             ┌────────────────────────────────────────┐              │
│                    │ Revenue Over Time                      │              │
│                    └────────────────────────────────────────┘              │
│                                                                             │
│  Subtitle          ┌────────────────────────────────────────┐              │
│                    │ Last 30 days                           │              │
│                    └────────────────────────────────────────┘              │
│                                                                             │
│  ── Data Configuration ──────────────────────────────────────              │
│                                                                             │
│  Data Source       ┌────────────────────────────────────────┐              │
│                    │ Sales API                          ▼   │              │
│                    └────────────────────────────────────────┘              │
│                                                                             │
│  Dimension (X)     ┌────────────────────────────────────────┐              │
│                    │ date                               ▼   │              │
│                    └────────────────────────────────────────┘              │
│                                                                             │
│  Metrics (Y)                                                                │
│  ┌────────────────────────────┐ ┌──────────────┐                           │
│  │ revenue                 ▼  │ │ SUM       ▼  │  [×]                      │
│  └────────────────────────────┘ └──────────────┘                           │
│  [+ Add Metric]                                                            │
│                                                                             │
│  ── Filtering ───────────────────────────────────────────────              │
│                                                                             │
│  Date Range        ┌────────────────────────────────────────┐              │
│                    │ Last 30 days                       ▼   │              │
│                    └────────────────────────────────────────┘              │
│                                                                             │
│  Group By          ┌────────────────────────────────────────┐              │
│                    │ Daily                              ▼   │              │
│                    └────────────────────────────────────────┘              │
│                                                                             │
│  ── Layout ──────────────────────────────────────────────────              │
│                                                                             │
│  Column Start  ┌────┐  Column Span  ┌────┐                                │
│                │ 1 ▼│               │ 6 ▼│                                │
│                └────┘               └────┘                                │
│  Row Start     ┌────┐  Row Span     ┌────┐                                │
│                │ 1 ▼│               │ 2 ▼│                                │
│                └────┘               └────┘                                │
│                                                                             │
│  ── Type-Specific Options ───────────────────────────────────              │
│                                                                             │
│  Show Points       [✓]                                                     │
│  Curve Type        ┌──────────────┐                                        │
│                    │ Monotone   ▼ │                                        │
│                    └──────────────┘                                        │
│                                                                             │
│  ── Preview ─────────────────────────────────────────────────              │
│  ┌──────────────────────────────────────────────────────────┐              │
│  │          Revenue Over Time                                │              │
│  │    3K ┤                                                   │              │
│  │       │        ╱╲                                         │              │
│  │    2K ┤    ╱╲╱╱  ╲    ╱╲                                  │              │
│  │       │   ╱        ╲  ╱  ╲                                │              │
│  │    1K ┤  ╱          ╲╱    ╲╱                               │              │
│  │       │ ╱                                                 │              │
│  │     0 ┼──┬──┬──┬──┬──┬──┬──                               │              │
│  │       Mar 1  8  15  22  29                                │              │
│  └──────────────────────────────────────────────────────────┘              │
│                                                                             │
│                                            [Cancel]  [Save Widget]         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
WidgetConfigPanel (slide-over or modal)
├── PanelHeader (title, close button)
├── ChartTypeSelector (dropdown)
├── TitleInput
├── SubtitleInput
├── DataConfigSection
│   ├── DataSourceSelect
│   ├── DimensionFieldSelect
│   └── MetricFieldList
│       └── MetricFieldRow (field select + aggregation select + remove button)
├── FilteringSection
│   ├── DateRangeSelect
│   └── GroupingPeriodSelect
├── LayoutSection
│   ├── ColumnStartSelect
│   ├── ColumnSpanSelect
│   ├── RowStartSelect
│   └── RowSpanSelect
├── TypeSpecificOptions (dynamic based on chart type)
│   ├── LineOptions (showPoints, curveType)
│   ├── BarOptions (mode: grouped/stacked)
│   ├── PieOptions (innerRadius toggle for donut)
│   ├── AreaOptions (stacked, fillOpacity)
│   ├── KpiOptions (prefix, suffix, comparisonPeriod, showSparkline)
│   ├── TableOptions (pageSize)
│   └── FunnelOptions (showPercentages)
├── ChartPreview (live rendering)
└── ActionButtons (Cancel, Save)
```

---

## 5. Embed Preview and Code Modal

**Reference:** §PRD FR-021

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Embed Dashboard                                               [×] Close   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Allowed Origins (comma-separated)                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ https://myapp.com, https://staging.myapp.com                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  Embed Code                                          [Copy] [iframe | JS]  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ <iframe                                                            │    │
│  │   src="https://embed.analyticsengine.dev/d/dsh_abc123              │    │
│  │         ?key=embed_xxxxxxxxxxxxxxxx"                               │    │
│  │   width="100%"                                                     │    │
│  │   height="600"                                                     │    │
│  │   frameborder="0"                                                  │    │
│  │   style="border: none; border-radius: 8px;"                       │    │
│  │ ></iframe>                                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  Preview                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ ┌─────────────────────────────────────────────────────────────────┐ │    │
│  │ │ LOGO  Sales Analytics                                          │ │    │
│  │ │                                                                │ │    │
│  │ │ ┌────────────────────┐ ┌────────────────────┐                  │ │    │
│  │ │ │  Revenue Over Time │ │  Revenue by Region  │                  │ │    │
│  │ │ │   📈 (line chart)  │ │   📊 (bar chart)   │                  │ │    │
│  │ │ │                    │ │                    │                  │ │    │
│  │ │ └────────────────────┘ └────────────────────┘                  │ │    │
│  │ │                                                                │ │    │
│  │ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                          │ │    │
│  │ │ │$125K │ │3,847 │ │$32.60│ │+12.3%│                          │ │    │
│  │ │ └──────┘ └──────┘ └──────┘ └──────┘                          │ │    │
│  │ │                                                                │ │    │
│  │ │                              Powered by Analytics Engine       │ │    │
│  │ └─────────────────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│                                           [Update Origins]  [Close]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Sync History Page

**Route:** `/sync-history`
**Reference:** §PRD FR-009

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Sync History                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Filter: ┌──────────────────┐  ┌──────────────┐                            │
│          │ All Sources    ▼ │  │ All Status ▼ │                            │
│          └──────────────────┘  └──────────────┘                            │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Data Source     │ Status     │ Rows     │ Failed │ Started    │ Dur. │   │
│  ├─────────────────┼────────────┼──────────┼────────┼────────────┼──────┤   │
│  │ Sales API       │ ● Running  │      483 │      0 │ 2 min ago  │  --  │   │
│  │ Sales API       │ ✓ Done     │    1,204 │      3 │ 1 hour ago │  12s │   │
│  │ User Events     │ ✓ Done     │      892 │      0 │ 2 hours    │   8s │   │
│  │ Sales API       │ ✗ Failed   │        0 │      0 │ 3 hours    │   2s │   │
│  │                 │            │          │        │            │      │   │
│  │  Error: Connection refused: api.example.com:443                      │   │
│  │  [View Dead Letter Events (2)]                                       │   │
│  │                 │            │          │        │            │      │   │
│  │ User Events     │ ✓ Done     │      876 │      1 │ 4 hours    │   9s │   │
│  │ Sales API       │ ✓ Done     │    1,195 │      0 │ 5 hours    │  11s │   │
│  │ Sales API       │ ✓ Done     │    1,201 │      2 │ 6 hours    │  13s │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ← Previous                                    Page 1 of 12    Next →      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
SyncHistoryPage
├── PageHeader
├── FilterBar
│   ├── DataSourceFilter (dropdown)
│   └── StatusFilter (dropdown)
├── SyncRunTable
│   ├── TableHeader (sortable columns)
│   └── SyncRunRow (x N)
│       ├── StatusIndicator (running/done/failed)
│       ├── RowCounts
│       ├── Timestamp (relative)
│       ├── Duration
│       └── ErrorDetails (expandable, conditional)
│           └── DeadLetterLink
└── Pagination
```

---

## 7. Theme Configuration

**Route:** `/settings/theme`
**Reference:** §PRD FR-024, FR-025

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Theme Settings                                             [Save Changes] │
├──────────────────────────────────┬──────────────────────────────────────────┤
│                                  │                                          │
│  Logo                            │  Live Preview                            │
│  ┌────────────────────────┐      │  ┌──────────────────────────────────┐    │
│  │  [logo.png]            │      │  │ LOGO  Sales Analytics            │    │
│  │  [Upload]  [Remove]    │      │  │                                  │    │
│  └────────────────────────┘      │  │ ┌────────────┐ ┌────────────┐    │    │
│                                  │  │ │            │ │            │    │    │
│  Primary Color                   │  │ │  Line      │ │  Bar       │    │    │
│  ┌──────────────────┐            │  │ │  Chart     │ │  Chart     │    │    │
│  │ [■] #3B82F6      │            │  │ │            │ │            │    │    │
│  └──────────────────┘            │  │ └────────────┘ └────────────┘    │    │
│                                  │  │                                  │    │
│  Secondary Color                 │  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │    │
│  ┌──────────────────┐            │  │ │$125│ │3.8K│ │ $33│ │+12%│    │    │
│  │ [■] #6366F1      │            │  │ └────┘ └────┘ └────┘ └────┘    │    │
│  └──────────────────┘            │  │                                  │    │
│                                  │  │                                  │    │
│  Background Color                │  │  Powered by Analytics Engine     │    │
│  ┌──────────────────┐            │  └──────────────────────────────────┘    │
│  │ [■] #FFFFFF      │            │                                          │
│  └──────────────────┘            │                                          │
│                                  │                                          │
│  Text Color                      │                                          │
│  ┌──────────────────┐            │                                          │
│  │ [■] #1F2937      │            │                                          │
│  └──────────────────┘            │                                          │
│                                  │                                          │
│  Font Family                     │                                          │
│  ┌──────────────────────────┐    │                                          │
│  │ Inter                 ▼  │    │                                          │
│  └──────────────────────────┘    │                                          │
│                                  │                                          │
│  Corner Radius                   │                                          │
│  ┌──────────────────────────┐    │                                          │
│  │ 8px     ◄━━━━●━━━━━━━►   │    │                                          │
│  └──────────────────────────┘    │                                          │
│                                  │                                          │
└──────────────────────────────────┴──────────────────────────────────────────┘
```

### Component Hierarchy

```
ThemeConfigPage
├── PageHeader (title, save button)
├── SplitLayout
│   ├── ConfigPanel (left)
│   │   ├── LogoUpload
│   │   │   ├── LogoPreview
│   │   │   ├── UploadButton
│   │   │   └── RemoveButton
│   │   ├── ColorPicker "Primary Color"
│   │   ├── ColorPicker "Secondary Color"
│   │   ├── ColorPicker "Background Color"
│   │   ├── ColorPicker "Text Color"
│   │   ├── FontFamilySelect
│   │   └── CornerRadiusSlider
│   └── PreviewPanel (right)
│       └── EmbedPreview (miniature dashboard with theme applied)
```

---

## 8. Embedded Dashboard View (End User)

**Route:** `embed.analyticsengine.dev/d/:dashboardId?key=:apiKey`
**Reference:** §PRD FR-022

### Desktop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  LOGO   Sales Analytics Dashboard                                          │
│                                                                             │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐   │
│  │                                 │ │                                 │   │
│  │  Revenue Over Time              │ │  Revenue by Region              │   │
│  │                                 │ │                                 │   │
│  │       ╱╲        ╱╲              │ │  US    ████████████████  $45K   │   │
│  │      ╱  ╲  ╱╲  ╱  ╲             │ │  EU    ██████████████   $38K   │   │
│  │     ╱    ╲╱  ╲╱    ╲            │ │  APAC  ████████████     $28K   │   │
│  │    ╱                ╲           │ │  LATAM ██████           $14K   │   │
│  │   ╱                  ╲          │ │                                 │   │
│  │  Mar 1   8   15   22   29       │ │                                 │   │
│  │                                 │ │                                 │   │
│  └─────────────────────────────────┘ └─────────────────────────────────┘   │
│                                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                      │
│  │          │ │          │ │          │ │          │                      │
│  │ $125.4K  │ │  3,847   │ │  $32.60  │ │  +12.3%  │                      │
│  │ Revenue  │ │  Orders  │ │ Avg Order│ │  Growth  │                      │
│  │ ▲ +8.2%  │ │ ▲ +5.1%  │ │ ▲ +2.9%  │ │ ▲ +1.4%  │                      │
│  │ ▁▂▃▃▅▆▇  │ │ ▁▂▃▄▅▅▆  │ │ ▃▃▃▄▄▄▅  │ │ ▂▃▃▄▅▆▇  │                      │
│  │          │ │          │ │          │ │          │                      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Sales Funnel                                                       │   │
│  │                                                                     │   │
│  │  ████████████████████████████████████████████████████  Visits   10K  │   │
│  │  ███████████████████████████████████████             Signups    7.2K │   │
│  │  █████████████████████████████                      Trials    5.1K │   │
│  │  ████████████████████                               Paid      3.4K │   │
│  │  █████████████                                      Retained  2.1K │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Region │ Product    │  Revenue │ Orders │ Avg Price │ Date         │   │
│  ├────────┼────────────┼──────────┼────────┼───────────┼──────────────┤   │
│  │ US     │ Widget A   │   $1,500 │     42 │    $35.71 │ 2026-03-15   │   │
│  │ EU     │ Widget B   │   $2,300 │     67 │    $34.33 │ 2026-03-15   │   │
│  │ US     │ Widget A   │   $1,800 │     51 │    $35.29 │ 2026-03-16   │   │
│  │ APAC   │ Widget C   │   $1,200 │     38 │    $31.58 │ 2026-03-16   │   │
│  │ EU     │ Widget A   │   $2,100 │     59 │    $35.59 │ 2026-03-17   │   │
│  ├────────┴────────────┴──────────┴────────┴───────────┴──────────────┤   │
│  │  ← Previous         Showing 1-5 of 247         Next →             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                        ○ Live    Powered by Analytics Engine│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

```
┌─────────────────────────────────────────────┐
│ LOGO  Sales Analytics                        │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │  Revenue Over Time                        │ │
│ │       ╱╲        ╱╲                        │ │
│ │      ╱  ╲  ╱╲  ╱  ╲                       │ │
│ │     ╱    ╲╱  ╲╱    ╲                      │ │
│ │    Mar 1   8   15   22   29               │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │  Revenue by Region                        │ │
│ │  US    ████████████████  $45K              │ │
│ │  EU    ██████████████   $38K              │ │
│ │  APAC  ████████████     $28K              │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │$125K │ │3,847 │ │$32.60│ │+12.3%│        │
│ │▲+8.2%│ │▲+5.1%│ │▲+2.9%│ │▲+1.4%│        │
│ └──────┘ └──────┘ └──────┘ └──────┘        │
│                                              │
│ ○ Live  Powered by Analytics Engine          │
└──────────────────────────────────────────────┘
```

### Mobile (<768px)

```
┌──────────────────────────────┐
│ LOGO  Sales Analytics        │
│                              │
│ ┌────────────────────────┐   │
│ │ Revenue Over Time      │   │
│ │     ╱╲    ╱╲           │   │
│ │    ╱  ╲╱╱  ╲╱          │   │
│ │   Mar    15    29      │   │
│ └────────────────────────┘   │
│                              │
│ ┌────────────────────────┐   │
│ │ Revenue by Region      │   │
│ │ US   ██████████  $45K  │   │
│ │ EU   █████████   $38K  │   │
│ │ APAC ████████    $28K  │   │
│ └────────────────────────┘   │
│                              │
│ ┌──────────┐ ┌──────────┐   │
│ │ $125.4K  │ │  3,847   │   │
│ │ Revenue  │ │  Orders  │   │
│ │ ▲ +8.2%  │ │ ▲ +5.1%  │   │
│ └──────────┘ └──────────┘   │
│ ┌──────────┐ ┌──────────┐   │
│ │  $32.60  │ │  +12.3%  │   │
│ │ Avg Order│ │  Growth  │   │
│ │ ▲ +2.9%  │ │ ▲ +1.4%  │   │
│ └──────────┘ └──────────┘   │
│                              │
│ ○ Live                       │
│ Powered by Analytics Engine  │
└──────────────────────────────┘
```

### Component Hierarchy

```
EmbedDashboard
├── EmbedHeader
│   ├── TenantLogo
│   └── DashboardTitle
├── WidgetGrid (CSS Grid, 12 columns)
│   └── EmbedWidget (x N, responsive)
│       ├── WidgetHeader (title, subtitle)
│       ├── LoadingSkeleton (while loading)
│       ├── ChartRenderer
│       │   ├── LineChart (Recharts)
│       │   ├── BarChart (Recharts)
│       │   ├── PieChart (Recharts)
│       │   ├── AreaChart (Recharts)
│       │   ├── KpiCard (custom)
│       │   │   ├── BigNumber
│       │   │   ├── ChangeIndicator (green/red)
│       │   │   └── Sparkline (optional)
│       │   ├── DataTable (custom)
│       │   │   ├── TableHeader
│       │   │   ├── TableBody (virtualized)
│       │   │   └── TablePagination
│       │   └── FunnelChart (D3)
│       └── WidgetError (conditional: "Data unavailable")
├── LiveIndicator ("● Live" / "Live updates paused")
├── PoweredByBadge (Free tier only)
└── SSEManager (invisible, manages connection)
```

### Responsive Breakpoints

| Breakpoint | Grid Behavior | KPI Cards | Charts |
|------------|---------------|-----------|--------|
| Desktop (>1024px) | 12 columns, widgets respect gridColumnStart/Span | 4 per row (3-col span each) | Side by side |
| Tablet (768-1024px) | 12 columns, max 12-col span per widget | 4 per row (3-col span each) | Stack vertically |
| Mobile (<768px) | Single column (all widgets full width) | 2 per row (6-col span each) | Full width, reduced height |

---

## 9. Document References

| Document | Section | Relationship |
|----------|---------|-------------|
| §PRD | FR-001 to FR-031 | Wireframes visualize all functional requirements |
| §SRS-1 | Monorepo Structure | Components map to apps/web and apps/embed |
| §SRS-2 | Data Model | Forms reflect entity fields and relationships |
| §SRS-3 | Domain Logic | Widget rendering matches query engine output |
| §SRS-4 | Security | Embed wireframe shows CSP and origin controls |
