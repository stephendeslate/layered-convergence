# Wireframes — Field Service Dispatch

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Dispatch Dashboard (Split View)

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Field Service Dispatch    [Acme HVAC] [Admin ▾]     │
├─────────────────────────────────┬───────────────────────────┤
│                                 │                            │
│  Live Map                       │  Dispatch Board            │
│  ┌───────────────────────────┐  │                            │
│  │         ○ J.Smith          │  │  UNASSIGNED (3)           │
│  │    ○ R.Jones               │  │  ┌──────────────────┐    │
│  │                ★ Customer  │  │  │ WO-005 URGENT    │    │
│  │        ○ M.Lee             │  │  │ Fix gas leak     │    │
│  │                            │  │  │ 123 Main St      │    │
│  │   ──── Route polyline      │  │  └──────────────────┘    │
│  │                            │  │  ┌──────────────────┐    │
│  │  [🔴 Urgent] [🟡 High]    │  │  │ WO-006 MEDIUM    │    │
│  │  [🟢 Available techs: 5]  │  │  │ AC maintenance   │    │
│  └───────────────────────────┘  │  └──────────────────┘    │
│                                 │                            │
│  Legend:                        │  EN_ROUTE (2)              │
│  ○ Technician  ★ Customer      │  ┌──────────────────┐    │
│  ── Optimized route             │  │ WO-001 HIGH      │    │
│                                 │  │ J.Smith → 12min  │    │
│  [Optimize Routes]              │  └──────────────────┘    │
│  [Auto-Assign All]              │                            │
└─────────────────────────────────┴───────────────────────────┘
```

## 2. Work Order Detail

```
┌─────────────────────────────────────────────────────────────┐
│ Work Order #WO-001                                           │
│                                                              │
│ Status: 🟡 EN_ROUTE              Priority: 🔴 HIGH          │
│ Service: HVAC Repair              Scheduled: Mar 20, 10:00  │
│                                                              │
│ Customer: Sarah Johnson                                      │
│ Address: 456 Oak Avenue, Springfield                         │
│ Phone: (555) 123-4567                                       │
│                                                              │
│ Technician: John Smith                                       │
│ Skills: HVAC, Electrical          ETA: 12 minutes           │
│                                                              │
│ Timeline:                                                    │
│ ──●── Mar 20, 08:00  UNASSIGNED   Created by dispatch       │
│ ──●── Mar 20, 08:15  ASSIGNED     Assigned to J. Smith      │
│ ──●── Mar 20, 09:45  EN_ROUTE     Technician departed       │
│ ──○── Mar 20, 10:00  Estimated arrival                      │
│                                                              │
│ Photos: (none yet)                                           │
│                                                              │
│ [Reassign] [Cancel]                                          │
│ Tracking URL: https://fsd.app/tracking/abc123               │
└─────────────────────────────────────────────────────────────┘
```

## 3. Technician Mobile UI

```
┌─────────────────────┐
│ My Jobs Today    [≡] │
│                      │
│ ┌──────────────────┐ │
│ │ 10:00 - WO-001   │ │
│ │ HVAC Repair       │ │
│ │ 456 Oak Ave       │ │
│ │ 🔴 HIGH           │ │
│ │                    │ │
│ │ [Start Route]     │ │
│ ├──────────────────┤ │
│ │ 11:30 - WO-003   │ │
│ │ AC Maintenance    │ │
│ │ 789 Pine St       │ │
│ │ 🟡 MEDIUM         │ │
│ │                    │ │
│ │ [Not Started]     │ │
│ ├──────────────────┤ │
│ │ 14:00 - WO-007   │ │
│ │ Furnace Install   │ │
│ │ 321 Elm Dr        │ │
│ │ 🟢 LOW            │ │
│ └──────────────────┘ │
│                      │
│ GPS: 🟢 Streaming    │
│ [Stop GPS]           │
└──────────────────────┘
```

## 4. Technician — Job Actions

```
┌─────────────────────┐
│ WO-001: HVAC Repair │
│ Status: ON_SITE     │
│                      │
│ Customer: S. Johnson │
│ 456 Oak Avenue       │
│                      │
│ ┌──────────────────┐ │
│ │ [Start Work]     │ │
│ │                    │ │
│ │ [Take Photo]     │ │
│ │                    │ │
│ │ [Add Notes]      │ │
│ │ ┌──────────────┐ │ │
│ │ │Replaced fan  │ │ │
│ │ │motor and     │ │ │
│ │ │cleaned coils │ │ │
│ │ └──────────────┘ │ │
│ │                    │ │
│ │ [Complete Job]   │ │
│ └──────────────────┘ │
│                      │
│ Photos (2):          │
│ [📷][📷]            │
└──────────────────────┘
```

## 5. Customer Tracking Portal

```
┌─────────────────────────────────────────────────────────────┐
│ [Acme HVAC Logo]                                             │
│                                                              │
│ Your Technician is on the way!                               │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐     │
│ │                                                      │     │
│ │     ○ John Smith                                     │     │
│ │      \                                               │     │
│ │       \                                              │     │
│ │        ----→ ★ Your Location                         │     │
│ │                                                      │     │
│ │                                                      │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                              │
│ ┌─────────────────┐                                         │
│ │  ETA: 12 min    │   John Smith, HVAC Specialist           │
│ │  ▓▓▓▓▓▓░░░░    │   Service: HVAC Repair                  │
│ └─────────────────┘   Scheduled: 10:00 AM                   │
│                                                              │
│ Status Timeline:                                             │
│ ✅ Dispatched    ✅ En Route    ○ Arrived    ○ Complete      │
│                                                              │
│ Work Order: #WO-001                                          │
│ Description: Annual HVAC maintenance and inspection          │
└─────────────────────────────────────────────────────────────┘
```

## 6. Route Optimization View

```
┌─────────────────────────────────────────────────────────────┐
│ Route Optimization: John Smith — Mar 20                      │
│                                                              │
│ ┌───────────────────────────────────┐                       │
│ │  ①───②                           │                       │
│ │      │                            │                       │
│ │      ③──④                         │                       │
│ │           │                       │                       │
│ │           ⑤                       │                       │
│ └───────────────────────────────────┘                       │
│                                                              │
│ Optimized Route (5 stops):                                   │
│ ① Start: Office (8:00)                                      │
│ ② WO-001: 456 Oak Ave (10:00-11:00)    HVAC Repair         │
│ ③ WO-003: 789 Pine St (11:30-12:30)    AC Maintenance      │
│ ④ WO-007: 321 Elm Dr (13:30-15:00)     Furnace Install     │
│ ⑤ End: Office (15:30)                                       │
│                                                              │
│ Total Distance: 28.4 km                                      │
│ Total Time: 7.5 hours (3h travel + 4.5h service)            │
│                                                              │
│ [Apply Route]  [Reset]                                       │
└─────────────────────────────────────────────────────────────┘
```

## 7. Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Dispatch Analytics                                           │
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ 24       │ │ 1:42     │ │ 87%      │ │ 96%      │       │
│ │ Jobs     │ │ Avg Time │ │ On Time  │ │ Utiliz.  │       │
│ │ Today    │ │ (hours)  │ │ Rate     │ │ Rate     │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ ┌────────────────────────────┐ ┌────────────────────────┐   │
│ │ Jobs Per Day (30 days)     │ │ By Service Type        │   │
│ │ ████                       │ │ HVAC       ████ 35%   │   │
│ │ ████ ████                  │ │ Plumbing   ███  28%   │   │
│ │ ████ ████ ████             │ │ Electrical ██   22%   │   │
│ │ ████ ████ ████ ████        │ │ General    █    15%   │   │
│ └────────────────────────────┘ └────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 8. Page Map

| Page | Route | Auth |
|------|-------|------|
| Login | /login | None |
| Dispatch Dashboard | /dispatch | JWT (ADMIN/DISPATCHER) |
| Work Order Detail | /work-orders/:id | JWT (ADMIN/DISPATCHER) |
| Technician List | /technicians | JWT (ADMIN) |
| Technician Schedule | /technicians/:id/schedule | JWT (ADMIN/DISPATCHER) |
| Route Optimization | /routes/optimize | JWT (ADMIN/DISPATCHER) |
| Technician Mobile | /technician/jobs | JWT (TECHNICIAN) |
| Customer Tracking | /tracking/:token | None (token auth) |
| Analytics | /analytics | JWT (ADMIN) |
| Invoices | /invoices | JWT (ADMIN) |
