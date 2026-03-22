# Escrow Marketplace — Authentication Specification

## Overview

JWT-based authentication with bcrypt password hashing.
Role-based access control with ADMIN exclusion from registration.

## Authentication Flow

<!-- VERIFY:EM-AUTH-01 auth service with bcrypt and JWT -->
<!-- VERIFY:EM-AUTH-02 auth controller with throttled endpoints -->

1. User registers with email, password, role, tenantId
2. Password hashed with bcrypt (salt rounds from shared constant)
3. JWT issued with sub, email, role, tenantId claims
4. Subsequent requests authenticated via Bearer token
5. JwtAuthGuard validates tokens on all non-public routes

## Password Security

<!-- VERIFY:EM-SEC-01 bcrypt salt rounds constant -->

- bcrypt with BCRYPT_SALT_ROUNDS (12) from @em/shared
- Salt rounds never hardcoded — always imported from shared
- Seed file imports BCRYPT_SALT_ROUNDS for consistency

## Role Management

<!-- VERIFY:EM-SEC-02 allowed registration roles excluding ADMIN -->

- ALLOWED_REGISTRATION_ROLES = ['BUYER', 'SELLER']
- ADMIN role excluded from public registration
- @IsIn(ALLOWED_REGISTRATION_ROLES) validates role in DTO
- Admin accounts created only via seed or direct DB access

## JWT Strategy

<!-- VERIFY:EM-SEC-06 JWT strategy for passport -->
<!-- VERIFY:EM-SEC-07 JWT auth guard with public route support -->

- JWT secret from environment variable (no hardcoded fallback)
- Token expiry: 24 hours
- Extracted from Authorization: Bearer header
- Public routes marked with @Public() decorator

## Rate Limiting

Auth endpoints use stricter throttling:
- Registration: 5 requests per 60 seconds
- Login: 5 requests per 60 seconds
- All other endpoints: 100 requests per 60 seconds (global)

## Public Routes

<!-- VERIFY:EM-SEC-04 public decorator to skip auth -->

Routes marked with @Public() bypass JWT auth:
- POST /auth/register
- POST /auth/login
- GET /health
- GET /health/ready
- GET /metrics

## Seed Data

<!-- VERIFY:EM-SEED-01 database seed with error states -->

Seed creates admin, seller, and buyer accounts.
Uses BCRYPT_SALT_ROUNDS from shared package.
Includes error/failure state entities.

## Cross-References

- See [security.md](./security.md) for Helmet, CORS, and throttling
- See [data-model.md](./data-model.md) for User model definition
