# Data Model — Escrow Marketplace

## Overview
Five core entities model the escrow marketplace domain. All monetary fields
use Decimal(12,2) precision. All tables use snake_case naming via Prisma
`@@map` and `@map` directives.

<!-- VERIFY:DM-001: All models use @@map for table names -->
<!-- VERIFY:DM-002: Multi-word columns use @map -->
<!-- VERIFY:DM-003: Monetary fields are Decimal(12,2) -->
<!-- VERIFY:DM-004: Role enum contains BUYER and SELLER only (no ADMIN at DB level) -->
<!-- VERIFY:DM-005: Transaction status enum matches state machine -->

## Entities

### User
| Field | Type | Constraints |
|-------|------|-------------|
| id | String (UUID) | Primary key, auto-generated |
| email | String | Unique, indexed |
| password | String | bcrypt hashed, salt 12 |
| name | String | Required |
| role | Role (enum) | BUYER or SELLER |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

### Transaction
| Field | Type | Constraints |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| amount | Decimal(12,2) | Required, positive |
| description | String | Required |
| status | TransactionStatus | Default: PENDING |
| buyerId | String (UUID) | FK → User |
| sellerId | String (UUID) | FK → User |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

### Dispute
| Field | Type | Constraints |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| reason | String | Required |
| status | DisputeStatus | Default: OPEN |
| transactionId | String (UUID) | FK → Transaction |
| filedById | String (UUID) | FK → User |
| resolvedAt | DateTime? | Nullable |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

### Payout
| Field | Type | Constraints |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| amount | Decimal(12,2) | Required |
| status | PayoutStatus | Default: PENDING |
| sellerId | String (UUID) | FK → User |
| transactionId | String (UUID) | FK → Transaction |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

### Webhook
| Field | Type | Constraints |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| url | String | Required, valid URL |
| event | String | Event type to listen for |
| userId | String (UUID) | FK → User |
| createdAt | DateTime | Auto-set |

## Enums

### Role
- `BUYER`
- `SELLER`

### TransactionStatus
- `PENDING` — Created, awaiting funding
- `FUNDED` — Payment received, held in escrow
- `SHIPPED` — Seller has shipped the item
- `DELIVERED` — Buyer confirms delivery
- `COMPLETED` — Funds released to seller
- `DISPUTE` — Under dispute investigation
- `REFUNDED` — Funds returned to buyer

### DisputeStatus
- `OPEN`
- `RESOLVED`

### PayoutStatus
- `PENDING`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

## Related Specifications
- See [API_CONTRACT.md](API_CONTRACT.md) for how entities map to endpoints
- See [SECURITY_MODEL.md](SECURITY_MODEL.md) for RLS policies on these tables
- See [PRODUCT_VISION.md](PRODUCT_VISION.md) for business context
