# Analytics Engine — State Machine Specification

## Overview

This document defines the two state machines in the Analytics Engine:
PipelineStatus and WidgetStatus. See DATA_MODEL.md for entity definitions
and API_SPEC.md for transition endpoints.

## PipelineStatus State Machine

### States
- VERIFY: AE-SM-PIPE-001 — PENDING: Initial state when pipeline run is created
- RUNNING: Pipeline is actively processing data
- COMPLETED: Pipeline finished successfully
- FAILED: Pipeline encountered an error (error_msg populated)
- CANCELLED: Pipeline was manually cancelled

### Transitions
- VERIFY: AE-SM-PIPE-002 — PENDING -> RUNNING (start execution)
- VERIFY: AE-SM-PIPE-003 — PENDING -> CANCELLED (cancel before start)
- RUNNING -> COMPLETED (success, sets completedAt)
- RUNNING -> FAILED (error, sets completedAt and errorMsg)
- RUNNING -> CANCELLED (manual cancellation during execution)
- FAILED -> PENDING (retry after failure)
- CANCELLED -> PENDING (re-queue after cancellation)
- COMPLETED -> (terminal, no outgoing transitions)

### Implementation
- Transition validation in PipelineService.transition()
- Invalid transitions return 400 BadRequestException
- Transition endpoint: PATCH /pipelines/runs/:id/transition
- Cross-references: API_SPEC.md (PATCH endpoint), DATA_MODEL.md (PipelineRun)

## WidgetStatus State Machine

### States
- VERIFY: AE-SM-WIDG-001 — DRAFT: Initial state when widget is created
- ACTIVE: Widget is visible on the dashboard
- ARCHIVED: Widget is hidden but retained
- ERROR: Widget encountered a rendering or data error

### Transitions
- VERIFY: AE-SM-WIDG-002 — DRAFT -> ACTIVE (publish widget)
- DRAFT -> ARCHIVED (archive before publishing)
- ACTIVE -> ARCHIVED (hide widget)
- ACTIVE -> ERROR (runtime error detected)
- ARCHIVED -> ACTIVE (restore widget)
- ERROR -> DRAFT (reset to fix configuration)
- ERROR -> ARCHIVED (archive broken widget)

### Implementation
- Widget status is set during create/update operations
- Status changes are recorded in audit logs
- Cross-references: DATA_MODEL.md (Widget.status), REQUIREMENTS.md (FR-4)

## Validation Rules

- All state transitions are validated server-side before persistence
- The VALID_TRANSITIONS map defines allowed from->to pairs
- Attempting an invalid transition returns HTTP 400 with descriptive message
- Terminal states (COMPLETED for pipelines) have empty transition arrays
- Cross-references: TESTING_STRATEGY.md (state machine tests)

## Seed Data States

- VERIFY: AE-SM-SEED-001 — Seed data includes error/failure states for testing
- PipelineRun seed includes COMPLETED, RUNNING, and FAILED states
- Widget seed includes ACTIVE and ERROR states
- Cross-references: DATA_MODEL.md (seed requirements)
