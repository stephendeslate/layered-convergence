# WIREFRAMES

**Project:** Field Service Dispatch
**Version:** 1.0
**Date:** 2026-03-20
**Status:** Draft

---

## 1. Overview

This document provides ASCII wireframes for all primary screens in the Field Service Dispatch platform. Wireframes include responsive breakpoints: desktop dispatch (>= 1024px), tablet (768-1023px), and mobile technician (< 768px).

## 2. Responsive Breakpoints

| Breakpoint | Target User | Layout Strategy |
|-----------|-------------|-----------------|
| Desktop (>= 1280px) | Dispatcher, Admin | Split view: map + board side-by-side |
| Laptop (1024-1279px) | Dispatcher, Admin | Narrower split view, collapsible panels |
| Tablet (768-1023px) | Dispatcher (field) | Tabbed view: map tab, board tab |
| Mobile (< 768px) | Technician, Customer | Single-column stack, large touch targets |

## 3. Dispatch Dashboard — Desktop (Split View)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                           │
│ [Logo] Field Service Dispatch    [Search...]    [Notifications 3]  [Dana ▾]      │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR    │  MAIN CONTENT                                                       │
│            │                                                                     │
│ [Dashboard]│  ┌─ DATE PICKER ──────────────────────────────────────────────────┐ │
│ [Dispatch] │  │ [<] March 20, 2026 [>]    [Today]    [Optimize All Routes]    │ │
│ [Work Ord] │  └──────────────────────────────────────────────────────────────── │ │
│ [Schedule] │                                                                     │
│ [Techs]    │  ┌─ MAP (50%) ──────────────────┬─ KANBAN BOARD (50%) ───────────┐ │
│ [Customers]│  │                               │                                │ │
│ [Routes]   │  │    ┌──┐                       │ UNASSIGNED (8)  │ ASSIGNED (5) │ │
│ [Invoices] │  │    │T1│ <Tyler>               │ ┌────────────┐  │ ┌──────────┐ │ │
│ [Analytics]│  │    └──┘                       │ │ WO-00042   │  │ │ WO-00038 │ │ │
│ [Settings] │  │         ┌──┐                  │ │ HVAC Repair│  │ │ Plumbing │ │ │
│            │  │         │T2│ <Jake>           │ │ 123 Main St│  │ │ HIGH     │ │ │
│ ────────── │  │         └──┘                  │ │ URGENT     │  │ │ Tyler S. │ │ │
│ TECHNICIANS│  │              ·····Route····>  │ │ 9:00-10:00 │  │ │ 10:30-11 │ │ │
│            │  │    [Pin]  [Pin]   [Pin]       │ └────────────┘  │ └──────────┘ │ │
│ ● Tyler S. │  │     WO     WO     WO         │ ┌────────────┐  │ ┌──────────┐ │ │
│   On Job   │  │                               │ │ WO-00043   │  │ │ WO-00039 │ │ │
│   3 jobs   │  │                               │ │ Electrical │  │ │ HVAC     │ │ │
│            │  │                               │ │ 456 Oak Ave│  │ │ NORMAL   │ │ │
│ ● Jake M.  │  │                               │ │ HIGH       │  │ │ Jake M.  │ │ │
│   Available│  │                               │ │ 11:00-12:00│  │ │ 11:00-12 │ │ │
│   2 jobs   │  │                               │ └────────────┘  │ └──────────┘ │ │
│            │  │         [Leaflet Map]         │                  │              │ │
│ ● Sarah K. │  │     OpenStreetMap tiles       │ EN_ROUTE (2)    │ ON_SITE (1)  │ │
│   En Route │  │                               │ ┌────────────┐  │ ┌──────────┐ │ │
│   4 jobs   │  │                               │ │ WO-00036   │  │ │ WO-00035 │ │ │
│            │  │   [+][-] zoom controls        │ │ Sarah K.   │  │ │ Tyler S. │ │ │
│ ● Mark R.  │  │                               │ │ ETA: 12min │  │ │ Started  │ │ │
│   Off Duty │  │   [Fit All] [Layers ▾]        │ └────────────┘  │ │ 14:05    │ │ │
│   0 jobs   │  │                               │                  │ └──────────┘ │ │
│            │  ├───────────────────────────────┤                  │              │ │
│            │  │ ◀──── Resize Handle ────▶     │ IN_PROGRESS (3) │ COMPLETED(12)│ │
│            │  └───────────────────────────────┴──────────────────┴──────────────┘ │
├──────────────────────────────────────────────────────────────────────────────────┤
│ FOOTER: 47 jobs today | 8 unassigned | 15 in progress | 22 completed            │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Dispatch Board Card Detail

```
┌────────────────────────┐
│ WO-00042         [···] │  <- Overflow menu (edit, cancel, view detail)
│ ─────────────────────  │
│ HVAC Repair            │  <- Service type
│ 123 Main St, Apt 4B    │  <- Address (truncated)
│ ─────────────────────  │
│ [URGENT]  9:00 - 10:00 │  <- Priority badge + time window
│ ─────────────────────  │
│ Carol Johnson          │  <- Customer name
│ Est: 45 min            │  <- Estimated duration
└────────────────────────┘
```

## 4. Live Map with Technician Markers and Routes

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    LEAFLET MAP (OpenStreetMap)                     │
│                                                                   │
│         ┌──────────────────────────┐                             │
│         │ LEGEND                    │                             │
│         │ ● Available technician    │                             │
│         │ ● En route technician     │                             │
│         │ ● On job technician       │                             │
│         │ ○ Off duty technician     │                             │
│         │ ◆ Work order (unassigned) │                             │
│         │ ◇ Work order (assigned)   │                             │
│         │ ─ Active route            │                             │
│         └──────────────────────────┘                             │
│                                                                   │
│              [T1]──────route──────>[WO]                           │
│             Tyler                  WO-35                          │
│                                                                   │
│     [T2]                                                         │
│     Jake                    ◆ WO-42                              │
│                              (unassigned)                         │
│                                                                   │
│          [T3]─ ─ ─ ─route─ ─ ─►[WO]─ ─ ─►[WO]                  │
│          Sarah               WO-36        WO-37                   │
│                             (next)        (after)                 │
│                                                                   │
│                          ◆ WO-43                                  │
│                           (unassigned)                            │
│                                                                   │
│   ┌────┐                                                         │
│   │ +  │  <- Zoom controls                                       │
│   │ -  │                                                         │
│   ├────┤                                                         │
│   │ ⊞  │  <- Fit all markers                                    │
│   └────┘                                                         │
│                                                                   │
│   ┌────────────────────────────────────────┐                     │
│   │ TECHNICIAN POPUP (on marker click)      │                     │
│   │                                         │                     │
│   │  Tyler Smith           [View Profile]   │                     │
│   │  Status: On Job                         │                     │
│   │  Current: WO-00035 (HVAC Repair)        │                     │
│   │  Next: WO-00038 (Plumbing) at 10:30     │                     │
│   │  Jobs today: 3/8                        │                     │
│   │  Last update: 2 seconds ago             │                     │
│   └────────────────────────────────────────┘                     │
└──────────────────────────────────────────────────────────────────┘
```

## 5. Work Order Detail Page

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [< Back to Work Orders]                                                      │
│                                                                              │
│ Work Order WO-00042                                    [Edit] [Cancel] [···] │
│ ════════════════════════════════════════════════════════════════════════════  │
│                                                                              │
│ ┌─ STATUS TIMELINE ───────────────────────────────────────────────────────┐  │
│ │                                                                         │  │
│ │  ● Created ──── ● Assigned ──── ● En Route ──── ○ On Site ──── ○ Done  │  │
│ │  Mar 19         Mar 20          Mar 20                                  │  │
│ │  3:42 PM        8:15 AM         9:05 AM                                │  │
│ │  by Dana        by Dana         by Tyler                               │  │
│ │                                                                         │  │
│ └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌─ DETAILS ─────────────────────────┬─ ASSIGNMENT ─────────────────────────┐ │
│ │                                    │                                      │ │
│ │  Service Type:  HVAC Repair        │  Technician: Tyler Smith             │ │
│ │  Priority:      [URGENT]           │  Status:     EN_ROUTE                │ │
│ │  Description:                      │  ETA:        12 minutes              │ │
│ │    AC unit not cooling. Customer   │  Phone:      (555) 123-4567          │ │
│ │    reports unusual noise from      │                                      │ │
│ │    outdoor compressor unit.        │  ┌──────────────────────────────┐   │ │
│ │                                    │  │     [Mini Map]               │   │ │
│ │  Estimated:  45 minutes            │  │     Technician -> WO         │   │ │
│ │  Actual:     -- (in progress)      │  │     Route shown              │   │ │
│ │                                    │  └──────────────────────────────┘   │ │
│ └────────────────────────────────────┴──────────────────────────────────────┘ │
│                                                                              │
│ ┌─ CUSTOMER ────────────────────────┬─ LOCATION ───────────────────────────┐ │
│ │                                    │                                      │ │
│ │  Name:   Carol Johnson             │  123 Main Street, Apt 4B             │ │
│ │  Phone:  (555) 987-6543            │  Springfield, IL 62701               │ │
│ │  Email:  carol@example.com         │                                      │ │
│ │                                    │  Scheduled: Mar 20, 9:00 - 10:00 AM  │ │
│ │  [Call] [Email] [Tracking Link]    │  [Open in Maps]                      │ │
│ └────────────────────────────────────┴──────────────────────────────────────┘ │
│                                                                              │
│ ┌─ LINE ITEMS ────────────────────────────────────────────────────────────┐  │
│ │  Type      Description              Qty    Unit Price    Total          │  │
│ │  ──────────────────────────────────────────────────────────────────     │  │
│ │  Labor     Diagnostic fee            1      $85.00        $85.00       │  │
│ │  Labor     HVAC repair (hourly)      1.5    $95.00        $142.50      │  │
│ │  Material  Capacitor replacement     1      $45.00        $45.00       │  │
│ │  ──────────────────────────────────────────────────────────────────     │  │
│ │                                     Subtotal:             $272.50      │  │
│ │                                     Tax (8.25%):          $22.48       │  │
│ │                                     TOTAL:                $294.98      │  │
│ │                                                                        │  │
│ │  [+ Add Line Item]                                                     │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│ ┌─ PHOTOS ─────────────────────────────────┬─ NOTES ─────────────────────┐  │
│ │                                           │                             │  │
│ │  ┌─────┐ ┌─────┐ ┌─────┐                │  Mar 20, 9:15 AM - Tyler    │  │
│ │  │     │ │     │ │     │                │  "Outdoor unit showing       │  │
│ │  │ IMG │ │ IMG │ │ IMG │                │   signs of capacitor          │  │
│ │  │  1  │ │  2  │ │  3  │                │   failure. Replacing."       │  │
│ │  └─────┘ └─────┘ └─────┘                │                             │  │
│ │                                           │  Mar 20, 8:20 AM - Dana    │  │
│ │  [+ Upload Photo]                         │  "Customer called to        │  │
│ │                                           │   confirm appointment."     │  │
│ │                                           │                             │  │
│ │                                           │  [+ Add Note]               │  │
│ └───────────────────────────────────────────┴─────────────────────────────┘  │
│                                                                              │
│ ┌─ INVOICE ───────────────────────────────────────────────────────────────┐  │
│ │  Status: DRAFT    Invoice #INV-00042    Total: $294.98                  │  │
│ │  [Edit Invoice]   [Send to Customer]                                    │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 6. Technician Mobile UI — Job List

```
┌─────────────────────────────────┐
│ ≡  Field Service    [●] Online  │  <- Hamburger menu, GPS status
├─────────────────────────────────┤
│                                  │
│  Good morning, Tyler             │
│  March 20, 2026                  │
│  5 jobs today                    │
│                                  │
├─────────────────────────────────┤
│ ┌─ CURRENT JOB ───────────────┐ │
│ │                              │ │
│ │  WO-00035  [IN PROGRESS]     │ │
│ │  HVAC Repair                 │ │
│ │  123 Main St, Apt 4B         │ │
│ │  Carol Johnson               │ │
│ │  9:00 - 10:00 AM             │ │
│ │                              │ │
│ │  ┌────────────────────────┐  │ │
│ │  │   COMPLETE JOB   ✓    │  │ │  <- Large green button (44px+ height)
│ │  └────────────────────────┘  │ │
│ │                              │ │
│ │  [Add Photo]  [Add Note]     │ │
│ │                              │ │
│ └──────────────────────────────┘ │
│                                  │
├─ NEXT UP ────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │  WO-00038  [ASSIGNED]        │ │
│ │  Plumbing Repair  [HIGH]     │ │
│ │  456 Oak Ave                 │ │
│ │  Bob Williams                │ │
│ │  10:30 - 11:30 AM            │ │
│ │                              │ │
│ │  ┌────────────────────────┐  │ │
│ │  │   START DRIVING   ▶   │  │ │  <- Large blue button
│ │  └────────────────────────┘  │ │
│ │                              │ │
│ │  [Navigate]                  │ │  <- Opens device maps app
│ └──────────────────────────────┘ │
│                                  │
├─ LATER ──────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │  WO-00041  [ASSIGNED]        │ │
│ │  Electrical Install          │ │
│ │  789 Elm Dr                  │ │
│ │  1:00 - 2:30 PM              │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │  WO-00044  [ASSIGNED]        │ │
│ │  HVAC Maintenance            │ │
│ │  321 Pine Ln                 │ │
│ │  3:00 - 4:00 PM              │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │  WO-00045  [ASSIGNED]        │ │
│ │  General Maintenance         │ │
│ │  654 Maple Ct                │ │
│ │  4:30 - 5:30 PM              │ │
│ └──────────────────────────────┘ │
│                                  │
├─────────────────────────────────┤
│ [Jobs]  [Schedule]  [Profile]    │  <- Bottom navigation
└─────────────────────────────────┘
```

## 7. Technician Mobile UI — Status Flow

```
State: ASSIGNED                    State: EN_ROUTE
┌─────────────────────────┐        ┌─────────────────────────┐
│ WO-00038                │        │ WO-00038                │
│ Plumbing Repair         │        │ Plumbing Repair         │
│ 456 Oak Ave             │        │ 456 Oak Ave             │
│                         │        │                         │
│  ┌───────────────────┐  │        │  ETA: 12 minutes        │
│  │  START DRIVING ▶  │  │ ────►  │  Distance: 5.2 km       │
│  └───────────────────┘  │        │                         │
│                         │        │  ┌───────────────────┐  │
│  [Navigate]             │        │  │   I'VE ARRIVED    │  │
│                         │        │  └───────────────────┘  │
└─────────────────────────┘        │                         │
                                   │  [Navigate] [Call Cust] │
                                   └─────────────────────────┘

State: ON_SITE                     State: IN_PROGRESS
┌─────────────────────────┐        ┌─────────────────────────┐
│ WO-00038                │        │ WO-00038                │
│ Plumbing Repair         │        │ Plumbing Repair         │
│ 456 Oak Ave             │        │ 456 Oak Ave             │
│                         │        │                         │
│  Arrived at 10:35 AM    │        │  Started at 10:37 AM    │
│                         │        │  Duration: 00:23:45     │
│  ┌───────────────────┐  │        │                         │
│  │  START WORK  ⚡   │  │ ────►  │  [Add Photo 📷]        │
│  └───────────────────┘  │        │  [Add Note  📝]         │
│                         │        │  [Add Line Item $]      │
│  [Add Photo] [Add Note] │        │                         │
│                         │        │  ┌───────────────────┐  │
└─────────────────────────┘        │  │  COMPLETE JOB  ✓  │  │
                                   │  └───────────────────┘  │
                                   └─────────────────────────┘
```

## 8. Customer Tracking Portal

```
Mobile View (most common access method):
┌──────────────────────────────────┐
│                                   │
│     [Acme HVAC Services Logo]     │
│                                   │
│  Your technician is on the way!   │
│                                   │
│  ┌────────────────────────────┐   │
│  │                             │   │
│  │      [LEAFLET MAP]          │   │
│  │                             │   │
│  │   [Tech]─ ─ ─route─ ─►[You]│   │
│  │                             │   │
│  │    Tyler is 5.2 km away     │   │
│  │                             │   │
│  └────────────────────────────┘   │
│                                   │
│  ┌────────────────────────────┐   │
│  │                             │   │
│  │   Estimated Arrival         │   │
│  │                             │   │
│  │      12 minutes             │   │
│  │                             │   │
│  │   ~9:32 AM                  │   │
│  │                             │   │
│  └────────────────────────────┘   │
│                                   │
│  ┌────────────────────────────┐   │
│  │ Technician                  │   │
│  │ ┌────┐                      │   │
│  │ │ 👤 │  Tyler Smith         │   │
│  │ └────┘  HVAC Specialist     │   │
│  │                             │   │
│  └────────────────────────────┘   │
│                                   │
│  ┌────────────────────────────┐   │
│  │ Appointment Details         │   │
│  │                             │   │
│  │ Service:  HVAC Repair       │   │
│  │ Window:   9:00 - 10:00 AM   │   │
│  │ Address:  123 Main St       │   │
│  │           Springfield, IL   │   │
│  └────────────────────────────┘   │
│                                   │
│  ┌────────────────────────────┐   │
│  │ Need help? Call us:         │   │
│  │ (555) 000-1234              │   │
│  └────────────────────────────┘   │
│                                   │
│  Powered by Field Service Dispatch│
└──────────────────────────────────┘

After Arrival:
┌──────────────────────────────────┐
│     [Acme HVAC Services Logo]     │
│                                   │
│  ┌────────────────────────────┐   │
│  │                             │   │
│  │     ✓ Tyler has arrived!    │   │
│  │                             │   │
│  │     Arrived at 9:28 AM      │   │
│  │                             │   │
│  └────────────────────────────┘   │
│                                   │
│  Your technician Tyler Smith      │
│  is now on site and will begin    │
│  work shortly.                    │
│                                   │
└──────────────────────────────────┘
```

## 9. Route Optimization View

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [< Back]  Route Optimization — Tyler Smith — March 20, 2026                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌─ MAP ──────────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │   [Start]────1────>[WO-38]────2────>[WO-41]────3────>[WO-44]          │   │
│ │    Home                                                    │           │   │
│ │                                                            4           │   │
│ │                                                            │           │   │
│ │                                                         [WO-45]       │   │
│ │                                                            │           │   │
│ │   ─── Original route (gray, dashed)                       5           │   │
│ │   ─── Optimized route (blue, solid)                       │           │   │
│ │                                                        [Return]       │   │
│ │                                                                        │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│ ┌─ COMPARISON ───────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │  ORIGINAL ORDER                        OPTIMIZED ORDER                 │   │
│ │  ──────────────                        ───────────────                 │   │
│ │  1. WO-00038 - 456 Oak Ave             1. WO-00041 - 789 Elm Dr       │   │
│ │     5.2 km, 12 min drive                  2.1 km, 5 min drive         │   │
│ │  2. WO-00041 - 789 Elm Dr             2. WO-00044 - 321 Pine Ln      │   │
│ │     8.7 km, 18 min drive                  3.4 km, 8 min drive         │   │
│ │  3. WO-00044 - 321 Pine Ln            3. WO-00038 - 456 Oak Ave      │   │
│ │     6.3 km, 14 min drive                  2.8 km, 7 min drive         │   │
│ │  4. WO-00045 - 654 Maple Ct           4. WO-00045 - 654 Maple Ct     │   │
│ │     4.1 km, 9 min drive                   3.2 km, 7 min drive         │   │
│ │                                                                        │   │
│ │  Total: 24.3 km, 53 min               Total: 11.5 km, 27 min         │   │
│ │                                                                        │   │
│ │  ┌──────────────────────────────────────────────────────────────────┐  │   │
│ │  │  SAVINGS: 12.8 km less driving | 26 minutes saved (49%)         │  │   │
│ │  └──────────────────────────────────────────────────────────────────┘  │   │
│ │                                                                        │   │
│ │          [Apply Optimized Route]          [Keep Original]              │   │
│ │                                                                        │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 10. Schedule View — Daily Calendar

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Schedule    [< Mar 19]  March 20, 2026  [Mar 21 >]    [Day] [Week]  [Month] │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ TIME    │ Tyler Smith  │ Jake Miller  │ Sarah Kim   │ Mark Reynolds          │
│ ────────┼──────────────┼──────────────┼─────────────┼────────────────────── │
│  8:00   │              │              │ ┌─────────┐ │                        │
│         │              │              │ │ WO-36   │ │                        │
│  8:30   │              │              │ │ Electr. │ │                        │
│         │              │              │ │ EN_ROUTE│ │                        │
│  9:00   │ ┌──────────┐ │              │ └─────────┘ │                        │
│         │ │ WO-35    │ │              │             │                        │
│  9:30   │ │ HVAC Rep │ │              │ ┌─────────┐ │                        │
│         │ │ IN_PROG  │ │ ┌──────────┐ │ │ WO-37   │ │                        │
│ 10:00   │ └──────────┘ │ │ WO-39    │ │ │ Plumb.  │ │                        │
│         │              │ │ HVAC     │ │ │ ASSIGN  │ │                        │
│ 10:30   │ ┌──────────┐ │ │ ASSIGNED │ │ └─────────┘ │                        │
│         │ │ WO-38    │ │ └──────────┘ │             │                        │
│ 11:00   │ │ Plumbing │ │              │             │                        │
│         │ │ ASSIGNED │ │              │ ┌─────────┐ │                        │
│ 11:30   │ └──────────┘ │              │ │ WO-40   │ │                        │
│         │              │              │ │ HVAC    │ │                        │
│ 12:00   │              │              │ │ ASSIGN  │ │                        │
│         │   LUNCH      │   LUNCH      │ └─────────┘ │                        │
│ 12:30   │              │              │             │                        │
│         │              │              │   LUNCH     │                        │
│  1:00   │ ┌──────────┐ │ ┌──────────┐ │             │                        │
│         │ │ WO-41    │ │ │ WO-43    │ │ ┌─────────┐ │                        │
│  1:30   │ │ Electr.  │ │ │ General  │ │ │ WO-46   │ │                        │
│         │ │ ASSIGNED │ │ │ ASSIGNED │ │ │ Pest    │ │                        │
│  2:00   │ │          │ │ └──────────┘ │ │ ASSIGN  │ │                        │
│         │ └──────────┘ │              │ └─────────┘ │                        │
│  2:30   │              │              │             │                        │
│         │              │              │             │                        │
│  3:00   │ ┌──────────┐ │              │             │       OFF DUTY         │
│         │ │ WO-44    │ │              │             │                        │
│  3:30   │ │ HVAC     │ │              │             │                        │
│         │ │ ASSIGNED │ │              │             │                        │
│  4:00   │ └──────────┘ │              │             │                        │
│         │              │              │             │                        │
│  4:30   │ ┌──────────┐ │              │             │                        │
│         │ │ WO-45    │ │              │             │                        │
│  5:00   │ │ General  │ │              │             │                        │
│         │ │ ASSIGNED │ │              │             │                        │
│  5:30   │ └──────────┘ │              │             │                        │
│ ────────┼──────────────┼──────────────┼─────────────┼────────────────────── │
│ TOTAL   │ 5 jobs       │ 2 jobs       │ 4 jobs      │ 0 jobs                 │
│ UTIL    │ 85%          │ 45%          │ 78%         │ 0%                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 11. Analytics Dashboard

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Analytics Dashboard         [Last 7 days ▾]  [All Technicians ▾]  [Export]   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌─ KPI CARDS ────────────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │   │
│ │  │ Jobs Today   │ │ Avg Compl.   │ │ Utilization  │ │ Revenue      │  │   │
│ │  │              │ │ Time         │ │              │ │ (This Week)  │  │   │
│ │  │     47       │ │   52 min     │ │    76%       │ │  $12,450     │  │   │
│ │  │  +12% ▲      │ │  -8% ▼      │ │  +5% ▲      │ │  +18% ▲      │  │   │
│ │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │   │
│ │                                                                        │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│ ┌─ JOBS COMPLETED (7-day trend) ─────────┬─ OPEN vs COMPLETED ───────────┐  │
│ │                                         │                               │  │
│ │  50 │          ██                       │      ┌──────────────┐         │  │
│ │  40 │    ██    ██ ██                    │      │    ◕         │         │  │
│ │  30 │ ██ ██ ██ ██ ██ ██                │      │  72% Done    │         │  │
│ │  20 │ ██ ██ ██ ██ ██ ██ ██             │      │  28% Open    │         │  │
│ │  10 │ ██ ██ ██ ██ ██ ██ ██             │      └──────────────┘         │  │
│ │   0 └─────────────────────              │                               │  │
│ │     Mon Tue Wed Thu Fri Sat Sun         │  Open:      13                │  │
│ │                                         │  Completed: 34                │  │
│ │  [Export CSV]                            │  Cancelled:  3                │  │
│ └─────────────────────────────────────────┴───────────────────────────────┘  │
│                                                                              │
│ ┌─ AVG COMPLETION TIME by Service Type ──┬─ TECHNICIAN UTILIZATION ──────┐  │
│ │                                         │                               │  │
│ │  HVAC Repair      ████████████  52m     │  Tyler S.   ████████████ 85%  │  │
│ │  HVAC Install     ████████████████ 78m  │  Sarah K.   ██████████   78%  │  │
│ │  Plumbing Repair  ██████████    45m     │  Jake M.    ██████       45%  │  │
│ │  Electrical       ████████████  58m     │  Lisa T.    █████████    72%  │  │
│ │  Cleaning         ██████        32m     │  Mark R.    ████         32%  │  │
│ │  General Maint.   ████████      42m     │                               │  │
│ │                                         │  Team Avg:  62%               │  │
│ │  [Export CSV]                            │  [Export CSV]                 │  │
│ └─────────────────────────────────────────┴───────────────────────────────┘  │
│                                                                              │
│ ┌─ REVENUE (Daily) ──────────────────────────────────────────────────────┐   │
│ │                                                                        │   │
│ │  $3k │                    ╱╲                                           │   │
│ │  $2k │        ╱╲    ╱╲  ╱  ╲  ╱╲                                     │   │
│ │  $1k │  ╱╲  ╱  ╲──╱  ╲╱    ╲╱  ╲                                    │   │
│ │   $0 └────────────────────────────                                     │   │
│ │       Mon  Tue  Wed  Thu  Fri  Sat  Sun                                │   │
│ │                                                                        │   │
│ │  Total: $12,450    Average: $1,778/day    [Export CSV]                  │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 12. Invoice Detail

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [< Back to Invoices]                                                         │
│                                                                              │
│ Invoice #INV-00042                           Status: [DRAFT]                 │
│ ════════════════════════════════════════════════════════════════════════════  │
│                                                                              │
│ ┌─ FROM ──────────────────────────┬─ TO ──────────────────────────────────┐  │
│ │                                  │                                      │  │
│ │  Acme HVAC Services              │  Carol Johnson                       │  │
│ │  100 Commerce Blvd               │  123 Main Street, Apt 4B             │  │
│ │  Springfield, IL 62701           │  Springfield, IL 62701               │  │
│ │  (555) 000-1234                  │  carol@example.com                   │  │
│ │                                  │  (555) 987-6543                      │  │
│ └──────────────────────────────────┴──────────────────────────────────────┘  │
│                                                                              │
│  Invoice Date:  March 20, 2026                                               │
│  Due Date:      April 3, 2026                                                │
│  Work Order:    WO-00042 (HVAC Repair)                                       │
│  Technician:    Tyler Smith                                                  │
│                                                                              │
│ ┌─ LINE ITEMS ────────────────────────────────────────────────────────────┐  │
│ │                                                                        │  │
│ │  #   Type      Description              Qty    Unit Price    Total     │  │
│ │  ──  ────────  ───────────────────────   ─────  ──────────   ──────── │  │
│ │  1   Labor     Diagnostic fee            1.00   $85.00       $85.00   │  │
│ │  2   Labor     HVAC repair (hourly)      1.50   $95.00       $142.50  │  │
│ │  3   Material  Capacitor replacement     1.00   $45.00       $45.00   │  │
│ │                                                                        │  │
│ │  [+ Add Line Item]                       ─────────────────────────── │  │
│ │                                          Subtotal:         $272.50    │  │
│ │                                          Tax (8.25%):      $22.48     │  │
│ │                                          ═══════════════════════════  │  │
│ │                                          TOTAL:            $294.98    │  │
│ │                                                                        │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Notes to customer:                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│ │  Replaced faulty capacitor on outdoor AC unit. Tested system and        │  │
│ │  confirmed proper cooling. Recommend scheduling annual maintenance.     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐           │
│  │  Send to Customer │  │  Edit Invoice    │  │  Void Invoice   │           │
│  │  (via Stripe)     │  │                  │  │  (Admin only)    │           │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘           │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 13. Responsive Layout — Tablet (768-1023px)

On tablet screens, the dispatch dashboard switches to a tabbed layout:

```
┌──────────────────────────────────┐
│ [Logo]  Dispatch   [🔔 3] [D ▾] │
├──────────────────────────────────┤
│ [  Map  ] [  Board  ] [  List  ] │  <- Tab bar
├──────────────────────────────────┤
│                                   │
│  (Active tab content fills the    │
│   full screen width)              │
│                                   │
│  MAP TAB:                         │
│  Full-width Leaflet map           │
│  Technician list as overlay       │
│  bottom sheet                     │
│                                   │
│  BOARD TAB:                       │
│  Horizontal-scrolling Kanban      │
│  Each column ~280px wide          │
│  Drag-and-drop still works        │
│                                   │
│  LIST TAB:                        │
│  Vertical work order list         │
│  Sortable, filterable             │
│                                   │
└──────────────────────────────────┘
```

## 14. Responsive Layout — Mobile Technician (< 768px)

The technician mobile UI is specifically designed for phones:

```
Design principles:
  - Minimum touch target: 44px x 44px
  - High contrast text (WCAG AA)
  - Large status buttons (full width, 56px height)
  - Bottom navigation bar (fixed)
  - Pull-to-refresh on job list
  - No horizontal scrolling
  - System font stack for fast rendering

Layout:
┌─────────────────────────────┐
│ HEADER (56px)               │
│ Status bar + GPS indicator  │
├─────────────────────────────┤
│                              │
│ CONTENT (scrollable)         │
│                              │
│ Current job card (prominent) │
│ Next job card                │
│ Remaining jobs (compact)     │
│                              │
├─────────────────────────────┤
│ BOTTOM NAV (56px, fixed)    │
│ [Jobs] [Schedule] [Profile] │
└─────────────────────────────┘
```

## 15. Component Library Reference

All UI components use shadcn/ui with Tailwind CSS. Key component mappings:

| Wireframe Element | shadcn/ui Component | Notes |
|-------------------|---------------------|-------|
| Work order cards | Card | With drag handle for dnd-kit |
| Status badges | Badge | Variant per status color |
| Priority badges | Badge | destructive for URGENT |
| Action buttons | Button | Size lg for mobile |
| Date picker | DatePicker (Calendar) | With presets (Today, Tomorrow) |
| Dropdown menus | DropdownMenu | For overflow actions |
| Technician selector | Combobox | Searchable with avatar |
| Work order filter | Select (multi) | With clear all |
| Toast notifications | Toast (Sonner) | For success/error feedback |
| Confirmation dialogs | AlertDialog | For destructive actions |
| Data tables | Table + DataTable | For work order lists |
| Timeline | Custom component | Based on shadcn examples |
| Charts | Recharts | Integrated with shadcn chart styles |

## 16. Color Scheme and Status Indicators

### 16.1 Work Order Status Colors

| Status | Background | Text | Badge Variant |
|--------|-----------|------|---------------|
| UNASSIGNED | gray-100 | gray-700 | outline |
| ASSIGNED | blue-100 | blue-700 | default |
| EN_ROUTE | indigo-100 | indigo-700 | default |
| ON_SITE | amber-100 | amber-700 | default |
| IN_PROGRESS | orange-100 | orange-700 | default |
| COMPLETED | green-100 | green-700 | default |
| INVOICED | emerald-100 | emerald-700 | default |
| PAID | teal-100 | teal-700 | default |
| CANCELLED | red-100 | red-700 | destructive |

### 16.2 Priority Colors

| Priority | Badge Color | Icon |
|----------|------------|------|
| LOW | gray | None |
| NORMAL | blue | None |
| HIGH | orange | Warning triangle |
| URGENT | red | Exclamation circle |

### 16.3 Technician Status Colors

| Status | Dot Color | Map Marker |
|--------|----------|------------|
| AVAILABLE | green-500 | Green circle |
| EN_ROUTE | blue-500 | Blue arrow |
| ON_JOB | orange-500 | Orange wrench |
| ON_BREAK | yellow-500 | Yellow pause |
| OFF_DUTY | gray-400 | Gray circle (dimmed) |

## 17. Map Marker Designs

```
Technician Markers (on Leaflet map):
  ┌───┐
  │ → │  <- Directional arrow showing heading
  │ TS │  <- Initials
  └─┬─┘
    │    <- Pin point

  Color: matches technician status (see 16.3)
  Size: 36px diameter
  Animation: smooth CSS transition between positions

Work Order Markers:
  ◆ (filled diamond) — Unassigned
  ◇ (open diamond)  — Assigned
  ✓ (check mark)    — Completed

  Color: matches priority (see 16.2)
  Size: 28px
  Cluster: markers cluster at zoom < 12 with count badge
```

## 18. Interaction Patterns

### 18.1 Drag-and-Drop on Dispatch Board

```
Drag start:
  - Card lifts with shadow (transform: scale(1.02))
  - Original position shows ghost placeholder (dashed border)
  - Valid drop zones highlight with blue border

Drag over valid target:
  - Column header shows blue highlight
  - Technician avatar shows blue ring
  - Cards reorder to show insertion point

Drop on invalid target:
  - Card animates back to original position (300ms spring)
  - Toast shows error: "Cannot move to ON_SITE — technician must be EN_ROUTE first"

Drop on valid target:
  - Card settles into new position
  - Optimistic update: card shows new status immediately
  - Server confirmation: status badge updates with checkmark
  - If server rejects: card snaps back, error toast shown
```

### 18.2 Map Interactions

```
Pan and zoom: standard Leaflet scroll/pinch
Click technician marker: popup with tech info + current job
Click work order marker: popup with WO summary + "View Detail" link
Click cluster: zoom to fit clustered markers
Right-click map: "Create work order at this location" context menu
Draw rectangle: select all markers within rectangle (for bulk operations)
```

## 19. Cross-References

- Product requirements (features): §PRD
- Business rules for dispatch: §BRD BR-400, BR-401
- WebSocket events for real-time UI: §SRS-3 Section 6
- GPS streaming protocol: §SRS-3 Section 6
- Route optimization display: §SRS-3 Section 5
- Responsive breakpoints: §PRD NFR-P3
- Component architecture: §SRS-1 Section 3
- Status colors and enums: §SRS-2 Section 2

---

*End of Wireframes Document*
