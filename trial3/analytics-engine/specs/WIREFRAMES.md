# Wireframes — Analytics Engine

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Tenant Admin — Dashboard Builder

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Analytics Engine          [Tenant: Acme Corp] [▾]   │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ Data     │  Dashboard: Web Analytics Overview                │
│ Sources  │  ┌─────────────────┬──────────────────────┐      │
│          │  │  Page Views      │  Revenue by Channel   │      │
│ Dash-    │  │  ═══════════     │  ████ Direct          │      │
│ boards   │  │  ╱╲  ╱╲ ╱╲     │  ████ Organic         │      │
│          │  │ ╱  ╲╱  ╲╱  ╲   │  ███  Social          │      │
│ Settings │  │ KPI: 12,450     │  ██   Referral        │      │
│          │  ├─────────────────┼──────────────────────┤      │
│ Embed    │  │  Conversion     │  Traffic Sources      │      │
│ Codes    │  │  ████           │  ┌──────┬──────┐      │      │
│          │  │  ████           │  │Direct│42.3% │      │      │
│          │  │  ███            │  │Orgnc │31.2% │      │      │
│          │  │  ██             │  │Socl  │18.5% │      │      │
│          │  │  █              │  │Refl  │ 8.0% │      │      │
│          │  └─────────────────┴──────────────────────┘      │
│          │                                                   │
│          │  [+ Add Widget]  [Publish]  [Get Embed Code]      │
└──────────┴──────────────────────────────────────────────────┘
```

## 2. Add Widget Dialog

```
┌──────────────────────────────────────┐
│  Add Widget                     [✕]  │
│                                      │
│  Widget Type: [Line Chart    ▾]      │
│                                      │
│  Data Source: [Website Traffic ▾]     │
│                                      │
│  X Axis:     [timestamp      ▾]      │
│  Y Axis:     [pageViews      ▾]      │
│  Group By:   [day            ▾]      │
│                                      │
│  Width:  [6] columns                 │
│  Height: [4] rows                    │
│                                      │
│  Preview:                            │
│  ┌──────────────────────────┐        │
│  │    ╱╲                    │        │
│  │   ╱  ╲    ╱╲            │        │
│  │  ╱    ╲  ╱  ╲           │        │
│  │ ╱      ╲╱    ╲          │        │
│  └──────────────────────────┘        │
│                                      │
│  [Cancel]              [Add Widget]  │
└──────────────────────────────────────┘
```

## 3. Data Source Configuration

```
┌─────────────────────────────────────────────────────────────┐
│ Data Sources                                                 │
│                                                              │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 🟢 Website Traffic API     Type: REST API              │   │
│ │    Last sync: 5 min ago    Rows: 12,450    Schedule: */15  │
│ │    [Configure] [Sync Now] [History]                    │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ 🟢 Sales Database          Type: PostgreSQL            │   │
│ │    Last sync: 1 hour ago   Rows: 8,200     Schedule: 0 * │
│ │    [Configure] [Sync Now] [History]                    │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ 🔴 CSV Import              Type: CSV                   │   │
│ │    Last sync: Failed       Rows: 0         Manual      │   │
│ │    [Configure] [Upload] [History]                      │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ 🟢 Event Webhook           Type: Webhook               │   │
│ │    URL: https://api.../ingest/abc123                   │   │
│ │    Events today: 342       [Copy URL] [History]        │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                              │
│ [+ Add Data Source]                                          │
└─────────────────────────────────────────────────────────────┘
```

## 4. Schema Mapping UI

```
┌─────────────────────────────────────────────────────────────┐
│ Field Mapping: Website Traffic API                           │
│                                                              │
│ Source Field          →    Analytics Field       Type        │
│ ┌──────────────────┐    ┌──────────────────┐  ┌─────────┐  │
│ │ page_url         │ →  │ page             │  │Dimension│  │
│ │ referrer_source  │ →  │ source           │  │Dimension│  │
│ │ device_type      │ →  │ device           │  │Dimension│  │
│ │ visit_count      │ →  │ visits           │  │Metric   │  │
│ │ revenue_usd      │ →  │ revenue          │  │Metric   │  │
│ │ event_timestamp  │ →  │ timestamp        │  │Timestamp│  │
│ └──────────────────┘    └──────────────────┘  └─────────┘  │
│                                                              │
│ Transform Steps:                                             │
│ 1. Cast revenue_usd → number                                │
│ 2. Derive bounce_rate = bounces / visits                    │
│ 3. Filter: visits > 0                                       │
│ [+ Add Transform]                                            │
│                                                              │
│ [Cancel]                              [Save Mapping]         │
└─────────────────────────────────────────────────────────────┘
```

## 5. Sync History

```
┌─────────────────────────────────────────────────────────────┐
│ Sync History: Website Traffic API                            │
│                                                              │
│ Status    Started           Duration   Rows     Errors      │
│ ✅ Done   Mar 20, 14:30    12s        1,245    0           │
│ ✅ Done   Mar 20, 14:15    11s        1,198    0           │
│ ❌ Fail   Mar 20, 14:00    3s         0        Timeout     │
│ ✅ Done   Mar 20, 13:45    13s        1,302    0           │
│ ✅ Done   Mar 20, 13:30    10s        1,156    0           │
│                                                              │
│ Dead Letter Queue: 3 events  [View & Retry]                  │
└─────────────────────────────────────────────────────────────┘
```

## 6. Embedded Dashboard (iframe)

```
┌─────────────────────────────────────────────────────────────┐
│ [Acme Corp Logo]  Web Analytics Dashboard                    │
│ Date Range: [Mar 1 - Mar 20]  [Apply]                       │
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ 12,450   │ │ 3.2%     │ │ $45,200  │ │ 2:34     │       │
│ │ Visitors │ │ Conv Rate│ │ Revenue  │ │ Avg Time │       │
│ │ ▲ +12%   │ │ ▲ +0.4%  │ │ ▲ +8%   │ │ ▼ -0:12  │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ ┌─────────────────────┐ ┌─────────────────────┐            │
│ │  Traffic Over Time   │ │  Revenue by Channel  │            │
│ │    ╱╲      ╱╲       │ │  ████ Direct 42%     │            │
│ │   ╱  ╲  ╱╱  ╲      │ │  ████ Organic 31%    │            │
│ │  ╱    ╲╱      ╲     │ │  ███  Social 19%     │            │
│ │ ╱              ╲    │ │  ██   Referral 8%    │            │
│ └─────────────────────┘ └─────────────────────┘            │
│                                                              │
│ ┌───────────────────────────────────────────────┐           │
│ │  Top Pages                                     │           │
│ │  Page              Views    Bounce   Conv      │           │
│ │  /homepage         4,532   34.2%    4.1%      │           │
│ │  /pricing          2,198   21.5%    8.7%      │           │
│ │  /blog/seo-tips    1,834   45.1%    2.3%      │           │
│ └───────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 7. Embed Code Generator

```
┌──────────────────────────────────────┐
│  Embed Code                     [✕]  │
│                                      │
│  Allowed Origins:                    │
│  [https://myapp.com          ] [+]   │
│  [https://staging.myapp.com  ] [×]   │
│                                      │
│  Theme Override:                     │
│  Background: [#ffffff]               │
│  Text Color: [#1f2937]              │
│                                      │
│  Embed Code:                         │
│  ┌──────────────────────────────┐   │
│  │ <iframe                      │   │
│  │   src="https://ae.app/      │   │
│  │     embed/abc123?            │   │
│  │     apiKey=xyz789"           │   │
│  │   width="100%"              │   │
│  │   height="600"              │   │
│  │   frameborder="0"           │   │
│  │ ></iframe>                  │   │
│  └──────────────────────────────┘   │
│  [Copy to Clipboard]                 │
│                                      │
│  [Save Config]                       │
└──────────────────────────────────────┘
```

## 8. Page Map

| Page | Route | Auth |
|------|-------|------|
| Dashboard Builder | /admin/dashboards/:id | Tenant Admin JWT |
| Data Sources | /admin/data-sources | Tenant Admin JWT |
| Data Source Config | /admin/data-sources/:id | Tenant Admin JWT |
| Sync History | /admin/data-sources/:id/history | Tenant Admin JWT |
| Embed Settings | /admin/dashboards/:id/embed | Tenant Admin JWT |
| Embedded Dashboard | /embed/:dashboardId | API Key |
