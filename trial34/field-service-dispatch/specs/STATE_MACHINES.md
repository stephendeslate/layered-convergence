# State Machines Specification — Field Service Dispatch

## Overview

The Field Service Dispatch platform uses a state machine pattern for work order status
management. Valid transitions are defined in the work order service and enforced
server-side. See API_SPEC.md for endpoint details and DATA_MODEL.md for the
WorkOrderStatus enum definition.

## Work Order Status State Machine

### States
- CREATED: Initial state when a work order is submitted by a dispatcher or owner
- ASSIGNED: Work order has been assigned to a technician for execution
- IN_PROGRESS: Technician has started working on the service request
- COMPLETED: Work order finished successfully (terminal state)
- CANCELLED: Work order was cancelled before completion (terminal state)
- ESCALATED: Work order requires higher-level attention or different expertise
- ON_HOLD: Work order is temporarily paused pending parts, access, or approval

### Valid Transitions
```
CREATED     -> ASSIGNED, CANCELLED
ASSIGNED    -> IN_PROGRESS, CANCELLED, ESCALATED
IN_PROGRESS -> COMPLETED, ON_HOLD, ESCALATED
ON_HOLD     -> IN_PROGRESS, CANCELLED
ESCALATED   -> ASSIGNED, CANCELLED
COMPLETED   -> (none — terminal state)
CANCELLED   -> (none — terminal state)
```

### Implementation
The transition map is defined as a Record<string, string[]> in workorder.service.ts.
Invalid transitions throw BadRequestException with a descriptive message including
both the current and requested status values.
- VERIFY: FD-DA-STATE-002 — Work order state machine transitions in workorder.service.ts

## Transition Semantics

### CREATED to ASSIGNED
A dispatcher assigns the work order to an available technician. The assignedToId
field is set on the work order, linking it to the technician record.

### ASSIGNED to IN_PROGRESS
The assigned technician begins work on the service request. This transition is
typically triggered by the technician from the mobile interface.

### IN_PROGRESS to COMPLETED
The technician marks the work as done. This is a terminal state — no further
transitions are possible once a work order is completed.

### Escalation Path
Both ASSIGNED and IN_PROGRESS orders can be escalated. Escalated orders can be
re-assigned to a different technician or cancelled entirely.

### Hold and Resume
IN_PROGRESS orders can be placed on hold (e.g., waiting for parts). ON_HOLD orders
can resume to IN_PROGRESS or be cancelled if the hold reason cannot be resolved.

## Error Handling

### Invalid Status Value
If the provided status is not in WORK_ORDER_STATUSES, return 400 with
"Invalid status: {value}".

### Invalid Transition
If the transition from current to new status is not in VALID_TRANSITIONS, return 400
with "Cannot transition from {current} to {new}".

### Work Order Not Found
If the work order ID does not exist within the tenant scope, return 404.
findFirst is used with tenant scope for RLS compliance (justification comment in source).

## Cross-References
- See API_SPEC.md for PATCH /workorders/:id/status endpoint documentation
- See DATA_MODEL.md for WorkOrderStatus enum definition
- See TESTING_STRATEGY.md for state transition test coverage
- See REQUIREMENTS.md for work order management requirements
