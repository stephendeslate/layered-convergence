# Testing Strategy — Escrow Marketplace

## Overview
Comprehensive testing approach covering unit tests, integration tests,
accessibility validation, and keyboard navigation verification.

See also: [SECURITY_MODEL.md](SECURITY_MODEL.md), [UI_SPECIFICATION.md](UI_SPECIFICATION.md)

## Backend Testing

### Unit Tests
<!-- VERIFY:EM-UNIT-TESTS -->
Service-level tests with mocked PrismaService:
- AuthService: 5 tests (register hash, JWT payload, login valid, login missing user, login wrong password)
- TransactionService: 6 tests (findAll, state transitions valid/invalid, not found, raw query, fund)
- DisputeService: 5 tests (findById, transitions valid/invalid/terminal, not found)

### Integration Tests
<!-- VERIFY:EM-INTEGRATION-TESTS -->
AppModule-based tests using supertest with PrismaService override:
- Health endpoint verification
- ADMIN role rejection on registration
- Invalid email rejection
- Short password rejection
- Invalid login body rejection
- Transaction listing
- Dispute listing

## Frontend Testing

### Accessibility Tests
<!-- VERIFY:EM-ACCESSIBILITY-TESTS -->
jest-axe validation on real rendered components:
- Button, Input+Label, Card, Badge, Nav
- Loading state aria attributes (role="status", aria-busy="true")
- Error state role verification (role="alert")

### Keyboard Navigation Tests
<!-- VERIFY:EM-KEYBOARD-TESTS -->
userEvent-based keyboard interaction tests:
- Tab focus progression between elements
- Enter key button activation
- Space key button activation
- Shift+Tab reverse navigation
- Disabled button focus skip

## Seed Data Testing
<!-- VERIFY:EM-SEED-TRANSITIONS -->
Seed data exercises full state machine lifecycle:
- Transaction: PENDING -> FUNDED -> RELEASED (success path)
- Transaction: PENDING -> FUNDED -> DISPUTED (T31 error state)
- Transaction: PENDING -> FUNDED -> REFUNDED (refund path)
- Dispute: OPEN -> UNDER_REVIEW (review process)
- Dispute: ESCALATED (direct escalation for unresponsive seller)
