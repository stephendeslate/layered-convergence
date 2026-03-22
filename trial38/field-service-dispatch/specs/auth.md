# Authentication Specification

## Overview

The authentication system uses JWT tokens with Passport.js for stateless
authentication. Passwords are hashed with bcrypt using a salt factor of 12.

## Module Structure

<!-- VERIFY: FD-AUTH-001 — Auth module with JWT -->
<!-- VERIFY: FD-AUTH-002 — Auth controller with rate-limited login/register -->
<!-- VERIFY: FD-AUTH-003 — Auth service with bcrypt salt 12 -->
<!-- VERIFY: FD-AUTH-004 — Registration DTO with role validation excluding ADMIN -->
<!-- VERIFY: FD-AUTH-005 — JWT strategy and guard (no secret fallback) -->
<!-- VERIFY: FD-AUTH-006 — Login DTO with input validation -->

## Endpoints

### POST /auth/register

Creates a new user account. Rate-limited to 5 requests per 60 seconds.

- **Input**: email, password, tenantId, role
- **Validation**: Role must be DISPATCHER, TECHNICIAN, or VIEWER (ADMIN excluded)
- **Security**: Password hashed with bcrypt salt 12, input sanitized
- **Output**: JWT access token

### POST /auth/login

Authenticates an existing user. Rate-limited to 5 requests per 60 seconds.

- **Input**: email, password, tenantId
- **Validation**: @MaxLength(36) on tenantId to prevent oversized payloads
- **Security**: Timing-safe comparison via bcrypt.compare
- **Output**: JWT access token

### GET /auth/me

Returns the current authenticated user profile.

- **Auth**: Requires valid JWT token in Authorization header
- **Output**: User object (id, email, role, tenantId)

## JWT Configuration

- **Secret**: Loaded from `JWT_SECRET` environment variable (no fallback)
- **Expiration**: 24 hours
- **Strategy**: `JwtStrategy` extracts token from Authorization Bearer header

## Role-Based Access

<!-- VERIFY: FD-SHARED-002 — Registration role whitelist -->
<!-- VERIFY: FD-SHARED-005 — Role validation for registration -->

Users have one of four roles: ADMIN, DISPATCHER, TECHNICIAN, VIEWER.
Self-registration is restricted to non-ADMIN roles to prevent
privilege escalation.

## Security Measures

- No JWT secret fallback value (fail-fast if env var missing)
- Bcrypt salt rounds set to 12 (constant from shared package)
- Input sanitized to strip HTML tags before database writes
- Sensitive data (passwords, tokens) masked in any logging
- Rate limiting on auth endpoints (5 per 60 seconds)
- MaxLength constraints on all DTO string fields

## Cross-References

- [Security Specification](./security.md) — Helmet, rate limiting, input validation details
