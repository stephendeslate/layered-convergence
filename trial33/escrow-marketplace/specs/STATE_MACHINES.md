# Escrow Marketplace — State Machine Specification

## Overview

This document defines the two state machines in the Escrow Marketplace:
EscrowStatus and DisputeStatus. See DATA_MODEL.md for entity definitions
and API_SPEC.md for transition endpoints.

## EscrowStatus State Machine

### States
- VERIFY: EM-SM-ESC-001 — CREATED: Initial state when transaction is created
- FUNDED: Buyer has deposited funds into escrow
- DELIVERED: Seller has delivered the goods or services
- RELEASED: Funds released to seller (terminal)
- DISPUTED: A dispute has been filed
- REFUNDED: Funds returned to buyer (terminal)
- CANCELLED: Transaction cancelled before funding (terminal)

### Transitions
- VERIFY: EM-SM-ESC-002 — CREATED -> FUNDED (buyer deposits funds)
- VERIFY: EM-SM-ESC-003 — CREATED -> CANCELLED (cancel before funding)
- FUNDED -> DELIVERED (seller delivers)
- FUNDED -> DISPUTED (buyer disputes before delivery)
- FUNDED -> REFUNDED (mutual agreement to refund)
- DELIVERED -> RELEASED (buyer confirms, funds released)
- DELIVERED -> DISPUTED (buyer disputes after delivery)
- DISPUTED -> REFUNDED (resolved in buyer's favor)
- DISPUTED -> RELEASED (resolved in seller's favor)
- RELEASED, REFUNDED, CANCELLED -> (terminal, no outgoing transitions)

### Implementation
- Transition validation in EscrowService.transition()
- Invalid transitions return 400 BadRequestException
- Transition endpoint: PATCH /escrow/:id/transition
- Cross-references: API_SPEC.md (PATCH endpoint), DATA_MODEL.md (EscrowTransaction)

## DisputeStatus State Machine

### States
- VERIFY: EM-SM-DISP-001 — OPEN: Initial state when dispute is filed
- UNDER_REVIEW: Arbiter is reviewing the dispute
- RESOLVED_BUYER: Resolved in buyer's favor
- RESOLVED_SELLER: Resolved in seller's favor
- ESCALATED: Dispute escalated to higher authority
- CLOSED: Dispute finalized (terminal)

### Transitions
- VERIFY: EM-SM-DISP-002 — OPEN -> UNDER_REVIEW (arbiter begins review)
- OPEN -> CLOSED (withdrawn by filer)
- UNDER_REVIEW -> RESOLVED_BUYER (arbiter decides for buyer)
- UNDER_REVIEW -> RESOLVED_SELLER (arbiter decides for seller)
- UNDER_REVIEW -> ESCALATED (needs higher authority)
- RESOLVED_BUYER -> CLOSED (finalize)
- RESOLVED_SELLER -> CLOSED (finalize)
- ESCALATED -> RESOLVED_BUYER or RESOLVED_SELLER (higher authority decides)
- CLOSED -> (terminal, no outgoing transitions)

### Implementation
- Transition validation in DisputeService.transition()
- resolvedAt timestamp set on resolution/closure
- Cross-references: API_SPEC.md (dispute endpoints), DATA_MODEL.md (Dispute)

## Seed Data States

- VERIFY: EM-SM-SEED-001 — Seed includes UNDER_REVIEW, ESCALATED, REFUNDED states
- Cross-references: DATA_MODEL.md (seed requirements)
