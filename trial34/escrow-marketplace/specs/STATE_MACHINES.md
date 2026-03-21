# State Machines Specification — Escrow Marketplace

## Overview

The Escrow Marketplace uses a state machine for transaction status management.
Valid transitions are defined in the transaction service and enforced server-side.
See API_SPEC.md for endpoint details and DATA_MODEL.md for TransactionStatus enum.

## Transaction Status State Machine

### States
- INITIATED: Buyer starts a transaction
- FUNDED: Buyer deposits funds into escrow
- SHIPPED: Seller ships the item
- DELIVERED: Buyer confirms receipt
- COMPLETED: Transaction finalized, funds released to seller (terminal)
- DISPUTED: Buyer or seller raises a dispute
- REFUNDED: Funds returned to buyer after dispute resolution (terminal)
- CANCELLED: Transaction cancelled before funding (terminal)

### Valid Transitions
```
INITIATED -> FUNDED, CANCELLED
FUNDED    -> SHIPPED, DISPUTED, REFUNDED
SHIPPED   -> DELIVERED, DISPUTED
DELIVERED -> COMPLETED, DISPUTED
COMPLETED -> (none — terminal state)
DISPUTED  -> REFUNDED, COMPLETED
REFUNDED  -> (none — terminal state)
CANCELLED -> (none — terminal state)
```

### Implementation
The transition map is defined as a Record<string, string[]> in transaction.service.ts.
Invalid transitions throw BadRequestException with a descriptive message.
- VERIFY: EM-DA-STATE-002 — Transaction state machine transitions in transaction.service.ts

## Error Handling

### Invalid Status Value
If the provided status is not in TRANSACTION_STATUSES, return 400.

### Invalid Transition
If the transition from current to new status is not allowed, return 400
with "Cannot transition from {current} to {new}".

### Transaction Not Found
If the transaction ID does not exist within the tenant scope, return 404.
findFirst is used with tenant scope for RLS compliance.

## Dispute Resolution

When a transaction enters DISPUTED state, a Dispute record can be created
to track the reason and eventual resolution. Resolution can lead to either
COMPLETED (funds to seller) or REFUNDED (funds to buyer).

## Cross-References
- See API_SPEC.md for PATCH /transactions/:id/status endpoint
- See DATA_MODEL.md for TransactionStatus enum definition
- See TESTING_STRATEGY.md for state transition test coverage
- See REQUIREMENTS.md for transaction processing requirements
