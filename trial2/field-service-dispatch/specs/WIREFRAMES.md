# Wireframes

## Field Service Dispatch & Management Platform

**Version:** 1.0
**Date:** 2026-03-20

---

## 1. Dispatch Board (Primary View)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🔧 FieldDispatch    [Dispatch] [Work Orders] [Technicians] [Analytics] [Admin]│
│                                                                    👤 Admin ▼  │
├──────────────────────────────────────────┬──────────────────────────────────────┤
│                                          │                                      │
│         LIVE MAP (Leaflet + OSM)         │        DISPATCH KANBAN BOARD          │
│                                          │                                      │
│  ┌────────────────────────────────────┐  │  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │                                    │  │  │UNASSIGN│ │ASSIGNED│ │EN ROUTE│  │
│  │     ◆ Tech: Mike (HVAC)           │  │  │  (5)   │ │  (3)   │ │  (2)   │  │
│  │         ↑ heading arrow            │  │  ├────────┤ ├────────┤ ├────────┤  │
│  │                                    │  │  │┌──────┐│ │┌──────┐│ │┌──────┐│  │
│  │    ▲ Tech: Sarah (Electrical)     │  │  ││WO-101││ ││WO-104││ ││WO-107││  │
│  │                                    │  │  ││HVAC  ││ ││Plumb ││ ││Elect ││  │
│  │   ● Customer: Johnson (URGENT)     │  │  ││URGENT││ ││NORMAL││ ││HIGH  ││  │
│  │   ○ Customer: Smith (NORMAL)       │  │  ││──────││ ││──────││ ││──────││  │
│  │                                    │  │  ││123 Ma││ ││456 Oa││ ││789 Pi││  │
│  │         ◇ Tech: Carlos (Plumbing) │  │  │└──────┘│ │└──────┘│ │└──────┘│  │
│  │                                    │  │  │┌──────┐│ │┌──────┐│ │        │  │
│  │   ─ ─ ─ Route polyline ─ ─ ─      │  │  ││WO-102││ ││WO-105││ │        │  │
│  │  1⃣──────2⃣──────3⃣               │  │  ││Plumb ││ ││HVAC  ││ │        │  │
│  │  (numbered stops)                  │  │  ││NORMAL││ ││HIGH  ││ │        │  │
│  │                                    │  │  │└──────┘│ │└──────┘│ │        │  │
│  │                                    │  │  │        │ │        │ │        │  │
│  │  [+ / -] [📍] [Optimize Routes]   │  │  │[+ New] │ │        │ │        │  │
│  └────────────────────────────────────┘  │  └────────┘ └────────┘ └────────┘  │
│                                          │                                      │
│  Legend: ◆◇▲ Technicians (by skill)     │  ┌────────┐ ┌────────┐ ┌────────┐  │
│          ●○ Customers (by priority)     │  │ON SITE │ │IN PROG │ │COMPLTD │  │
│          ─── Route polyline              │  │  (1)   │ │  (2)   │ │  (4)   │  │
│                                          │  ├────────┤ ├────────┤ ├────────┤  │
│  Stats: 17 jobs today | 6 active techs  │  │┌──────┐│ │┌──────┐│ │┌──────┐│  │
│         3 unassigned | Avg ETA: 22 min   │  ││WO-108││ ││WO-109││ ││WO-110││  │
│                                          │  │└──────┘│ │└──────┘│ │└──────┘│  │
│                                          │  └────────┘ └────────┘ └────────┘  │
├──────────────────────────────────────────┴──────────────────────────────────────┤
│  Status Bar: 🟢 Connected | Last update: 2s ago | 6 technicians online         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Work Order Card (Detail Popup)

```
┌──────────────────────────────────────┐
│  Work Order #WO-101                  │
│  ─────────────────────────────────   │
│  🔴 URGENT | HVAC Repair            │
│                                      │
│  Customer: Robert Johnson            │
│  Address:  123 Main St, Denver CO    │
│  Phone:    (303) 555-1234            │
│                                      │
│  Scheduled: Today, 10:00 AM          │
│  Duration:  ~90 min                  │
│                                      │
│  Status:   ● UNASSIGNED              │
│                                      │
│  Description:                        │
│  AC unit not cooling, making loud    │
│  grinding noise. Residential unit.   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Assign Technician         ▼ │   │
│  ├──────────────────────────────┤   │
│  │ ◆ Mike Torres (HVAC) 2.3km │   │
│  │ ▲ Sarah Kim (HVAC) 5.1km   │   │
│  │ ◇ Ana Lopez (HVAC) 8.7km   │   │
│  └──────────────────────────────┘   │
│                                      │
│  [Auto-Assign]  [Assign]  [Cancel]   │
└──────────────────────────────────────┘
```

---

## 3. Technician Mobile UI

### 3.1 Job List View

```
┌────────────────────────────┐
│  🔧 My Jobs Today    ☰    │
│  ─────────────────────     │
│  Wednesday, March 20       │
│                            │
│  ┌──────────────────────┐  │
│  │ 1. HVAC Repair   🔴  │  │
│  │    Robert Johnson     │  │
│  │    123 Main St        │  │
│  │    10:00 AM | ~90min  │  │
│  │    Status: ASSIGNED   │  │
│  │                       │  │
│  │ [▶ START ROUTE]       │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ 2. AC Install    🔵  │  │
│  │    Lisa Martinez      │  │
│  │    456 Oak Ave        │  │
│  │    1:00 PM | ~120min  │  │
│  │    Status: ASSIGNED   │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ 3. Thermostat    🔵  │  │
│  │    David Chen         │  │
│  │    789 Pine Rd        │  │
│  │    3:30 PM | ~60min   │  │
│  │    Status: ASSIGNED   │  │
│  └──────────────────────┘  │
│                            │
│  ─────────────────────     │
│  3 jobs remaining          │
│  Est. completion: 5:30 PM  │
└────────────────────────────┘
```

### 3.2 Active Job View

```
┌────────────────────────────┐
│  ← Back     EN ROUTE  🟡  │
│  ─────────────────────     │
│                            │
│  HVAC Repair               │
│  Robert Johnson            │
│  123 Main St, Denver CO    │
│                            │
│  ┌──────────────────────┐  │
│  │    [Map Preview]      │  │
│  │    ETA: 12 minutes    │  │
│  │    Distance: 4.2 mi   │  │
│  └──────────────────────┘  │
│                            │
│  [🗺 Open in Maps]         │
│                            │
│  ─────────────────────     │
│  Notes:                    │
│  AC unit not cooling,      │
│  making loud grinding      │
│  noise. Residential unit.  │
│                            │
│  ─────────────────────     │
│                            │
│  ┌──────────────────────┐  │
│  │                       │  │
│  │   [📍 I'VE ARRIVED]  │  │
│  │                       │  │
│  └──────────────────────┘  │
│                            │
│  Large touch target (56px) │
└────────────────────────────┘
```

### 3.3 Job Completion View

```
┌────────────────────────────┐
│  ← Back   IN PROGRESS 🟢  │
│  ─────────────────────     │
│                            │
│  HVAC Repair               │
│  Robert Johnson            │
│  Started: 10:15 AM         │
│  Duration: 47 min          │
│                            │
│  ─────────────────────     │
│  Photos (2):               │
│  ┌──────┐ ┌──────┐        │
│  │      │ │      │ [+ Add]│
│  │ 📷 1 │ │ 📷 2 │        │
│  │      │ │      │        │
│  └──────┘ └──────┘        │
│                            │
│  ─────────────────────     │
│  Completion Notes:         │
│  ┌──────────────────────┐  │
│  │ Replaced compressor   │  │
│  │ fan motor. System     │  │
│  │ tested and cooling    │  │
│  │ properly.             │  │
│  └──────────────────────┘  │
│                            │
│  ─────────────────────     │
│                            │
│  ┌──────────────────────┐  │
│  │                       │  │
│  │  [✓ COMPLETE JOB]    │  │
│  │                       │  │
│  └──────────────────────┘  │
│                            │
└────────────────────────────┘
```

---

## 4. Customer Tracking Portal

```
┌────────────────────────────────────────────┐
│                                            │
│  🔧 AcePro HVAC Services                  │
│                                            │
│  ═══════════════════════════════           │
│                                            │
│  Your technician is on the way!            │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │                                      │  │
│  │        [Live Map - Leaflet]          │  │
│  │                                      │  │
│  │    ◆ Mike Torres                     │  │
│  │     ↘  (moving toward you)          │  │
│  │                                      │  │
│  │                                      │  │
│  │              ● Your Location         │  │
│  │                                      │  │
│  │    ─ ─ ─ Route line ─ ─ ─           │  │
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │                                      │  │
│  │   ⏱  12 minutes away                │  │
│  │   📏 4.2 miles                       │  │
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ─────────────────────────────────         │
│  Technician: Mike Torres                   │
│  Service: HVAC Repair                      │
│  ─────────────────────────────────         │
│                                            │
│  Status Timeline:                          │
│  ┌──────────────────────────────────────┐  │
│  │                                      │  │
│  │  ✓ Dispatched         9:30 AM       │  │
│  │  │                                   │  │
│  │  ✓ Technician Assigned 9:32 AM      │  │
│  │  │                                   │  │
│  │  ● En Route            9:45 AM      │  │
│  │  │  (currently here)                 │  │
│  │  ○ Arriving                          │  │
│  │  │                                   │  │
│  │  ○ Work Started                      │  │
│  │  │                                   │  │
│  │  ○ Completed                         │  │
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ─────────────────────────────────         │
│  Questions? Call (303) 555-9999            │
│                                            │
└────────────────────────────────────────────┘
```

---

## 5. Route Optimization View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔧 FieldDispatch > Route Optimization                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Technician: [Mike Torres ▼]     Date: [2026-03-20]    [Optimize Routes]    │
│                                                                              │
│  ┌────────────────────────────────────────┬──────────────────────────────┐   │
│  │                                        │                              │   │
│  │      OPTIMIZED ROUTE MAP               │  ROUTE DETAILS               │   │
│  │                                        │                              │   │
│  │  ◆ Start (current location)           │  Total Distance: 28.4 mi    │   │
│  │  │                                     │  Total Duration: 52 min     │   │
│  │  │  ─ ─ (4.2 mi, 12 min)             │  Stops: 4                    │   │
│  │  │                                     │  Savings: 23% vs naive     │   │
│  │  1⃣ WO-101: HVAC Repair              │                              │   │
│  │  │  123 Main St                       │  ─────────────────────       │   │
│  │  │                                     │                              │   │
│  │  │  ─ ─ (2.1 mi, 6 min)              │  Stop Order:                 │   │
│  │  │                                     │                              │   │
│  │  2⃣ WO-105: AC Service               │  1. WO-101 HVAC Repair      │   │
│  │  │  456 Oak Ave                       │     123 Main St              │   │
│  │  │                                     │     ETA: 10:12 AM           │   │
│  │  │  ─ ─ (6.8 mi, 18 min)             │     Duration: ~90 min       │   │
│  │  │                                     │                              │   │
│  │  3⃣ WO-102: Thermostat Replace       │  2. WO-105 AC Service       │   │
│  │  │  789 Pine Rd                       │     456 Oak Ave              │   │
│  │  │                                     │     ETA: 11:48 AM           │   │
│  │  │  ─ ─ (3.3 mi, 9 min)              │     Duration: ~60 min       │   │
│  │  │                                     │                              │   │
│  │  4⃣ WO-108: Filter Replace           │  3. WO-102 Thermostat       │   │
│  │     321 Elm Blvd                      │     789 Pine Rd              │   │
│  │                                        │     ETA: 1:54 PM            │   │
│  │                                        │     Duration: ~45 min       │   │
│  │                                        │                              │   │
│  │                                        │  4. WO-108 Filter           │   │
│  │                                        │     321 Elm Blvd            │   │
│  │                                        │     ETA: 2:48 PM            │   │
│  │                                        │     Duration: ~30 min       │   │
│  └────────────────────────────────────────┴──────────────────────────────┘   │
│                                                                              │
│  Before optimization: 37.1 mi | After: 28.4 mi | Saved: 8.7 mi (23%)       │
│                                                                              │
│  [Apply Route] [Reset to Default Order] [Export]                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Work Order Management

### 6.1 Work Order List

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔧 FieldDispatch > Work Orders                              [+ New Order] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Filter: [All Statuses ▼] [All Priorities ▼] [All Technicians ▼] [Search]  │
│                                                                              │
│  ┌───────┬──────────────┬────────────┬──────────┬──────────┬──────────────┐ │
│  │ ID    │ Title        │ Customer   │ Tech     │ Priority │ Status       │ │
│  ├───────┼──────────────┼────────────┼──────────┼──────────┼──────────────┤ │
│  │WO-101 │ HVAC Repair  │ R.Johnson  │ M.Torres │ 🔴 URGENT│ ● ASSIGNED  │ │
│  │WO-102 │ Thermostat   │ D.Chen     │ M.Torres │ 🔵 NORMAL│ ● ASSIGNED  │ │
│  │WO-103 │ Pipe Leak    │ S.Adams    │    —     │ 🟠 HIGH  │ ○ UNASSIGNED│ │
│  │WO-104 │ Drain Clear  │ M.Garcia   │ C.Ruiz   │ 🔵 NORMAL│ ● EN_ROUTE  │ │
│  │WO-105 │ AC Service   │ L.Martinez │ M.Torres │ 🟠 HIGH  │ ● ASSIGNED  │ │
│  │WO-106 │ Water Heater │ P.Wilson   │    —     │ 🔵 NORMAL│ ○ UNASSIGNED│ │
│  │WO-107 │ Panel Upgrade│ K.Thomas   │ S.Kim    │ 🟠 HIGH  │ ● EN_ROUTE  │ │
│  │WO-108 │ Filter       │ J.Brown    │ M.Torres │ ⚪ LOW   │ ● ASSIGNED  │ │
│  └───────┴──────────────┴────────────┴──────────┴──────────┴──────────────┘ │
│                                                                              │
│  Showing 8 of 17 work orders                            [← 1 2 3 →]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Work Order Detail + Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│  🔧 FieldDispatch > Work Orders > WO-101                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HVAC Repair — Not Cooling                    Status: ASSIGNED   │
│  ═══════════════════════════════════════                         │
│                                                                  │
│  ┌─────────────────────┐  ┌────────────────────────────────┐   │
│  │ Customer             │  │ Assignment                     │   │
│  │ Robert Johnson       │  │ Technician: Mike Torres       │   │
│  │ 123 Main St          │  │ Skills: HVAC, Electrical      │   │
│  │ Denver, CO 80202     │  │ Distance: 2.3 km              │   │
│  │ (303) 555-1234       │  │ Assigned: 9:32 AM             │   │
│  └─────────────────────┘  └────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Status Timeline                                            │ │
│  │                                                            │ │
│  │  ✓ Created            Mar 20, 9:15 AM    by: Dispatcher   │ │
│  │  │  "Customer called about AC not cooling"                 │ │
│  │  │                                                         │ │
│  │  ✓ Assigned           Mar 20, 9:32 AM    by: Dispatcher   │ │
│  │  │  "Auto-assigned to Mike Torres (2.3km away)"            │ │
│  │  │                                                         │ │
│  │  ○ En Route           (pending)                            │ │
│  │  ○ On Site            (pending)                            │ │
│  │  ○ In Progress        (pending)                            │ │
│  │  ○ Completed          (pending)                            │ │
│  │  ○ Invoiced           (pending)                            │ │
│  │  ○ Paid               (pending)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Edit] [Reassign] [Cancel Order] [View on Map]                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Admin Panel

### 7.1 Company Settings

```
┌─────────────────────────────────────────────────────────────────┐
│  🔧 FieldDispatch > Admin > Company Settings                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Company Information                                             │
│  ─────────────────                                              │
│  Company Name:  [AcePro HVAC Services          ]               │
│  Address:       [1000 Business Pkwy, Denver CO  ]               │
│  Phone:         [(303) 555-9999                 ]               │
│  Email:         [dispatch@acepro-hvac.com       ]               │
│                                                                  │
│  Service Area                                                    │
│  ─────────────                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  [Map showing service area polygon]                   │       │
│  │                                                       │       │
│  │   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐                              │       │
│  │   │  Denver Metro     │                              │       │
│  │   │  Service Area     │                              │       │
│  │   └ ─ ─ ─ ─ ─ ─ ─ ─ ┘                              │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  Working Hours                                                   │
│  ─────────────                                                  │
│  Mon-Fri:  [8:00 AM] to [6:00 PM]                              │
│  Saturday: [9:00 AM] to [2:00 PM]                              │
│  Sunday:   [Closed                ]                              │
│                                                                  │
│  [Save Changes]                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Technician Management

```
┌─────────────────────────────────────────────────────────────────┐
│  🔧 FieldDispatch > Admin > Technicians            [+ Add Tech] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┬───────────────┬────────────────┬────────┬────────┐│
│  │ Status  │ Name          │ Skills         │ Jobs   │Actions ││
│  ├─────────┼───────────────┼────────────────┼────────┼────────┤│
│  │ 🟢 Avail│ Mike Torres   │ HVAC, Elec     │ 4 today│ [Edit] ││
│  │ 🟡 Busy │ Sarah Kim     │ Electrical     │ 2 today│ [Edit] ││
│  │ 🟢 Avail│ Carlos Ruiz   │ Plumbing       │ 3 today│ [Edit] ││
│  │ 🔴 Off  │ Ana Lopez     │ HVAC           │ 0 today│ [Edit] ││
│  │ 🟢 Avail│ James Park    │ General, HVAC  │ 1 today│ [Edit] ││
│  │ 🟡 Busy │ Maria Santos  │ Plumbing, Gen  │ 3 today│ [Edit] ││
│  └─────────┴───────────────┴────────────────┴────────┴────────┘│
│                                                                  │
│  Active: 5 | Off Duty: 1 | Total: 6                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔧 FieldDispatch > Analytics                                               │
│  Date Range: [This Week ▼]  [Mar 18] to [Mar 20]                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Jobs Today   │  │ Avg Duration │  │ Revenue      │  │ Outstanding  │   │
│  │    12        │  │   72 min     │  │  $4,280      │  │  $1,560      │   │
│  │  ↑ 20% WoW  │  │  ↓ 8% WoW   │  │  ↑ 15% WoW  │  │  ↓ 5% WoW   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │ Jobs by Status                   │  │ Technician Utilization           │ │
│  │                                  │  │                                  │ │
│  │  Completed  ████████████  12    │  │  Mike T.  ████████████  85%    │ │
│  │  In Prog    ████  4              │  │  Sarah K. ████████  72%       │ │
│  │  En Route   ██  2                │  │  Carlos R ████████████  88%   │ │
│  │  Assigned   ████  3              │  │  James P. ████  45%           │ │
│  │  Unassigned █  1                 │  │  Maria S. ██████████  78%     │ │
│  │                                  │  │                                  │ │
│  └──────────────────────────────────┘  └──────────────────────────────────┘ │
│                                                                              │
│  ┌──────────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │ Jobs by Priority                 │  │ Revenue This Week                │ │
│  │                                  │  │                                  │ │
│  │  Urgent  ██  8%                  │  │  Mon  ████████  $1,200          │ │
│  │  High    ██████  25%             │  │  Tue  ██████████  $1,520       │ │
│  │  Normal  ████████████  55%      │  │  Wed  ██████████████  $1,560   │ │
│  │  Low     ████  12%               │  │  Thu  (projected)              │ │
│  │                                  │  │  Fri  (projected)              │ │
│  └──────────────────────────────────┘  └──────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Login Page

```
┌────────────────────────────────────────┐
│                                        │
│                                        │
│       🔧 FieldDispatch                 │
│       Field Service Management         │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │  Email                           │  │
│  │  [admin@acepro-hvac.com       ]  │  │
│  │                                  │  │
│  │  Password                        │  │
│  │  [••••••••                    ]  │  │
│  │                                  │  │
│  │  [        Sign In             ]  │  │
│  │                                  │  │
│  │  Don't have an account?          │  │
│  │  [Register your company]         │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Demo Accounts:                        │
│  admin@acepro-hvac.com / demo123      │
│  tech@acepro-hvac.com / demo123       │
│                                        │
└────────────────────────────────────────┘
```

---

## 10. Create Work Order Form

```
┌─────────────────────────────────────────────────────────────┐
│  🔧 FieldDispatch > Work Orders > New Work Order            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Customer *                                                  │
│  [Search customers...                              ▼]       │
│                                                              │
│  Title *                                                     │
│  [HVAC Repair - Not Cooling                         ]       │
│                                                              │
│  Service Type *           Priority                          │
│  [HVAC Repair        ▼]  [● Normal ▼]                     │
│                                                              │
│  Description                                                 │
│  ┌──────────────────────────────────────────────────┐       │
│  │ AC unit in main building not cooling.             │       │
│  │ Customer reports grinding noise from outdoor      │       │
│  │ unit. Residential central air system.             │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│  Address *                                                   │
│  [123 Main Street, Denver, CO 80202                 ]       │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │  [Mini map showing pin at address]                │       │
│  │          📍                                       │       │
│  └──────────────────────────────────────────────────┘       │
│  Lat: 39.7392  Lng: -104.9903                               │
│                                                              │
│  Scheduled Date/Time          Estimated Duration            │
│  [2026-03-20  ]  [10:00 AM]  [90 minutes         ]        │
│                                                              │
│  Notes                                                       │
│  [Customer prefers morning appointments             ]       │
│                                                              │
│  [Cancel]                            [Create Work Order]    │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Invoice View

```
┌─────────────────────────────────────────────────────────────┐
│  🔧 FieldDispatch > Invoices > INV-2026-0042                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  INVOICE                            Status: ● SENT          │
│  ═══════                                                    │
│                                                              │
│  AcePro HVAC Services               Invoice #: INV-2026-42 │
│  1000 Business Pkwy                 Date: Mar 20, 2026      │
│  Denver, CO 80202                   Due: Apr 19, 2026       │
│                                                              │
│  Bill To:                                                    │
│  Robert Johnson                                              │
│  123 Main Street                                             │
│  Denver, CO 80202                                            │
│                                                              │
│  ─────────────────────────────────────────────────────      │
│  Work Order: WO-101 — HVAC Repair                           │
│  ─────────────────────────────────────────────────────      │
│                                                              │
│  ┌───────────────────────────────┬─────┬────────┬────────┐ │
│  │ Description                   │ Qty │ Rate   │ Amount │ │
│  ├───────────────────────────────┼─────┼────────┼────────┤ │
│  │ HVAC Repair — Labor           │ 1.5 │ $85/hr │$127.50 │ │
│  │ Compressor fan motor (parts)  │ 1   │ $95.00 │ $95.00 │ │
│  ├───────────────────────────────┼─────┼────────┼────────┤ │
│  │                    Subtotal   │     │        │$222.50 │ │
│  │                    Tax (8%)   │     │        │ $17.80 │ │
│  │                    TOTAL      │     │        │$240.30 │ │
│  └───────────────────────────────┴─────┴────────┴────────┘ │
│                                                              │
│  [Edit Invoice] [Send to Customer] [  Pay Now  ]           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Responsive Breakpoints

| Breakpoint | Layout | Target Device |
|------------|--------|---------------|
| < 640px | Single column, stacked views | Mobile phones |
| 640-1024px | Simplified split view | Tablets |
| > 1024px | Full split view (map + Kanban) | Desktop |

### Mobile Adaptations
- Dispatch board: map and Kanban are separate tabs, not side-by-side
- Work order list: card layout instead of table
- Technician UI: full-width cards with large touch targets (min 44px)
- Customer portal: single column, map takes 60% of viewport height
- Navigation: hamburger menu instead of horizontal nav

---

## 13. Color Scheme

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary | Blue | #2563EB | Buttons, links, active states |
| Urgent | Red | #DC2626 | Urgent priority, errors |
| High | Orange | #EA580C | High priority, warnings |
| Normal | Blue | #3B82F6 | Normal priority |
| Low | Gray | #6B7280 | Low priority |
| Success | Green | #16A34A | Completed, available |
| Warning | Yellow | #CA8A04 | In progress, busy |
| Technician HVAC | Purple | #7C3AED | HVAC technician markers |
| Technician Plumbing | Cyan | #0891B2 | Plumbing technician markers |
| Technician Electrical | Amber | #D97706 | Electrical technician markers |
| Background | White | #FFFFFF | Main background |
| Surface | Gray-50 | #F9FAFB | Card backgrounds |
| Border | Gray-200 | #E5E7EB | Borders, dividers |
| Text | Gray-900 | #111827 | Primary text |
| Text Muted | Gray-500 | #6B7280 | Secondary text |
