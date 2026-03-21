# Field Service Dispatch — State Machine Specification

## Overview

This document defines the work order state machine in Field Service Dispatch.
See DATA_MODEL.md for entity definitions and API_SPEC.md for transition endpoints.

## WorkOrderStatus State Machine

### States
- VERIFY: FD-SM-WO-001 — CREATED: Initial state when work order is submitted
- ASSIGNED: Technician has been assigned to the work order
- EN_ROUTE: Technician is traveling to the service location
- IN_PROGRESS: Technician is actively working on the order
- COMPLETED: Work order finished successfully (terminal)
- CANCELLED: Work order cancelled (terminal)
- ON_HOLD: Work order paused pending parts, approval, or customer

### Transitions
- VERIFY: FD-SM-WO-002 — CREATED -> ASSIGNED (dispatcher assigns technician)
- VERIFY: FD-SM-WO-003 — CREATED -> CANCELLED (customer cancels before assignment)
- ASSIGNED -> EN_ROUTE (technician begins travel)
- ASSIGNED -> CANCELLED (cancelled after assignment)
- ASSIGNED -> ON_HOLD (paused for parts or scheduling)
- EN_ROUTE -> IN_PROGRESS (technician arrives on site)
- EN_ROUTE -> CANCELLED (cancelled during travel)
- EN_ROUTE -> ON_HOLD (paused during travel)
- IN_PROGRESS -> COMPLETED (work finished, sets completedAt)
- IN_PROGRESS -> ON_HOLD (paused for parts)
- IN_PROGRESS -> CANCELLED (cancelled during work)
- ON_HOLD -> ASSIGNED (resume after hold)
- ON_HOLD -> CANCELLED (cancel from hold)
- COMPLETED, CANCELLED -> (terminal, no outgoing transitions)

### Transition Recording
- VERIFY: FD-SM-WO-004 — All transitions recorded in work_order_transitions table
- Each transition stores: workOrderId, fromStatus, toStatus, changedBy, reason, timestamp
- Transition history is immutable (append-only)
- Cross-references: DATA_MODEL.md (WorkOrderTransition)

### Implementation
- Transition validation in DispatchService.transition()
- Uses $transaction to atomically update status and create transition record
- Invalid transitions return 400 BadRequestException
- Transition endpoint: PATCH /work-orders/:id/transition
- Cross-references: API_SPEC.md (PATCH endpoint)

## Seed Data States

- VERIFY: FD-SM-SEED-001 — Seed includes IN_PROGRESS, CANCELLED, ON_HOLD states
- Seed includes transition records for status history
- Cross-references: DATA_MODEL.md (seed requirements)

## Validation Rules

- The VALID_TRANSITIONS map defines allowed from->to pairs
- Terminal states have empty transition arrays
- startedAt set when transitioning to IN_PROGRESS
- completedAt set when transitioning to COMPLETED
- Cross-references: TESTING_STRATEGY.md (state machine tests)
