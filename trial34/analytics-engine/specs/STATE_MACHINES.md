# State Machines Specification — Analytics Engine

## Overview

The Analytics Engine uses a state machine pattern for pipeline status management.
Valid transitions are defined in the pipeline service and enforced server-side.
See API_SPEC.md for endpoint details and DATA_MODEL.md for the PipelineStatus enum.

## Pipeline Status State Machine

### States
- PENDING: Initial state when pipeline is created
- RUNNING: Pipeline is actively processing data
- COMPLETED: Pipeline finished successfully (terminal)
- FAILED: Pipeline encountered an error (terminal)
- CANCELLED: Pipeline was manually cancelled (terminal)

### Valid Transitions
```
PENDING   -> RUNNING, CANCELLED
RUNNING   -> COMPLETED, FAILED, CANCELLED
COMPLETED -> (none — terminal state)
FAILED    -> (none — terminal state)
CANCELLED -> (none — terminal state)
```

### Implementation
The transition map is defined as a Record<string, string[]> in pipeline.service.ts.
Invalid transitions throw BadRequestException with a descriptive message.
- VERIFY: AE-DA-STATE-002 — Pipeline state machine transitions in pipeline.service.ts

## Shared Utilities Used by State Machine

### Slug Generation
Pipeline names are converted to URL-safe slugs using the shared slugify() function
when creating new pipelines. This ensures consistent URL patterns.
### Status Constants
Pipeline status values are exported from the shared package as PIPELINE_STATUSES constant.
The service validates incoming status values against this constant before checking transitions.

## Error Handling

### Invalid Status Value
If the provided status is not in PIPELINE_STATUSES, return 400 with "Invalid status: {value}".

### Invalid Transition
If the transition from current to new status is not in VALID_TRANSITIONS, return 400
with "Cannot transition from {current} to {new}".

### Pipeline Not Found
If the pipeline ID does not exist within the tenant scope, return 404.
findFirst is used with tenant scope for RLS compliance.

## Cross-References
- See API_SPEC.md for PATCH /pipelines/:id/status endpoint documentation
- See DATA_MODEL.md for PipelineStatus enum definition
- See TESTING_STRATEGY.md for state transition test coverage
- See REQUIREMENTS.md for pipeline orchestration requirements
