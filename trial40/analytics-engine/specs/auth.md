# Authentication Specification

## Overview
JWT-based authentication with bcrypt password hashing.
Registration restricts ADMIN role creation. Auth endpoints rate-limited.

## Authentication Flow

### Registration
1. Client sends POST /auth/register with email, password, name, role, tenantId
2. Server validates DTO: @IsIn(ALLOWED_REGISTRATION_ROLES) blocks ADMIN
3. Server checks email uniqueness via findFirst
4. Password hashed with bcrypt using BCRYPT_SALT_ROUNDS (12) from shared
5. User created in database with hashed password
6. JWT token returned with sub, email, role, tenantId claims
- VERIFY:AE-AUTH-01 — isAllowedRegistrationRole validates against allowed list

### Login
1. Client sends POST /auth/login with email, password
2. Server finds user by email via findFirst
3. bcrypt.compare validates password against stored hash
4. JWT token returned on success; 401 on failure
- VERIFY:AE-AUTH-03 — JWT strategy with no secret fallback

### Profile
1. Client sends GET /auth/profile with Authorization: Bearer <token>
2. JwtAuthGuard extracts and validates token
3. User profile returned (id, email, name, role, tenantId, createdAt)

## Rate Limiting
Auth endpoints limited to 5 requests per 60 seconds via @Throttle decorator.
- VERIFY:AE-SEC-04 — Auth endpoints rate-limited 5/60s

## JWT Configuration
- Secret from JWT_SECRET environment variable (no fallback)
- Token expiry: 24 hours
- Payload: { sub: userId, email, role, tenantId }

## Password Security
- Minimum length: 8 characters (enforced by @MinLength)
- Maximum length: 128 characters (enforced by @MaxLength)
- Hashing: bcrypt with 12 salt rounds
- Salt rounds imported from shared package constant
Cross-reference: security.md for broader security context.

## Role Hierarchy
- ADMIN: Full access (cannot be self-registered)
- EDITOR: Create/update access
- VIEWER: Read-only access

## Error Handling
- 400: Validation errors (invalid email, missing fields)
- 401: Invalid credentials or missing token
- 409: Email already registered
Cross-reference: api.md for error response format.
