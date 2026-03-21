# Escrow Marketplace — Authentication & Authorization Specification

## Overview

Authentication and authorization rules for the Escrow Marketplace platform.
See API_SPEC.md for endpoint details and SECURITY.md for broader security controls.

## Authentication

### JWT Configuration
- VERIFY: EM-AUTH-JWT-001 — JWT tokens signed with JWT_SECRET from environment
- VERIFY: EM-AUTH-JWT-002 — No hardcoded fallback for JWT_SECRET
- Token expiry: 24 hours
- Token payload: { sub: userId, email, role, tenantId }
- Extraction: Bearer token from Authorization header
- Cross-references: SECURITY.md (secret management)

### Password Hashing
- VERIFY: EM-AUTH-BCRYPT-001 — bcrypt with salt rounds = 12
- Passwords stored as password_hash column (never plaintext)
- Login compares input against stored hash using bcrypt.compare()
- Cross-references: DATA_MODEL.md (User.passwordHash)

## Authorization

### Role Model
- VERIFY: EM-AUTH-ROLES-001 — Four roles: ADMIN, BUYER, SELLER, ARBITER
- Role is assigned at registration and stored on the User entity
- ADMIN role cannot be self-assigned during registration
- Cross-references: DATA_MODEL.md (Role enum)

### Registration Restrictions
- VERIFY: EM-AUTH-NOREG-001 — Registration DTO uses @IsIn(['BUYER', 'SELLER', 'ARBITER'])
- VERIFY: EM-AUTH-NOREG-002 — AuthService.register() validates with isAllowedRegistrationRole()
- ADMIN accounts must be created by existing ADMINs or via seed data
- Cross-references: API_SPEC.md (POST /auth/register)

### Tenant Isolation
- VERIFY: EM-AUTH-TENANT-001 — JWT payload includes tenantId
- All data queries filter by tenantId from the JWT
- RLS provides database-level enforcement as defense in depth
- Cross-references: SECURITY.md (RLS policies), DATA_MODEL.md (tenant_id columns)

## Session Management

- Stateless JWT — no server-side session storage
- Token refresh is not supported (re-login required after expiry)
- Cross-references: API_SPEC.md (POST /auth/login)

## Fail-Fast Behavior

- VERIFY: EM-AUTH-FAILFAST-001 — Application throws on startup if JWT_SECRET is missing
- VERIFY: EM-AUTH-FAILFAST-002 — Application throws on startup if CORS_ORIGIN is missing
- No default values or fallbacks for security-critical configuration
- Cross-references: SECURITY.md (environment validation)

## Guard Implementation

- NestJS AuthGuard('jwt') applied to all protected endpoints
- PassportStrategy validates token signature and expiry
- Invalid tokens return 401 Unauthorized
- Cross-references: API_SPEC.md (protected endpoints)
