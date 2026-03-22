# Authentication Specification

## Overview

Authentication uses JWT tokens issued upon successful login. Users register
with an email, password, and role. Role selection is constrained to a
whitelist of allowed registration roles defined in the shared package.

## Registration Flow

Users provide email, password, name, and role. The role is validated against
ALLOWED_REGISTRATION_ROLES using @IsIn() — never @IsEnum().

[VERIFY: AE-AUTH-01] The register DTO uses @IsIn(ALLOWED_REGISTRATION_ROLES)
for role validation, not @IsEnum.

[VERIFY: AE-AUTH-02] The register DTO imports ALLOWED_REGISTRATION_ROLES
from @analytics-engine/shared.

## Login Flow

Users authenticate with email and password. The service verifies the password
hash using bcrypt and returns a signed JWT token.

[VERIFY: AE-AUTH-03] The auth service hashes passwords with bcrypt before
storing them.

[VERIFY: AE-AUTH-04] The auth service signs JWT tokens using the secret from
process.env.JWT_SECRET without any hardcoded fallback.

## JWT Strategy

The JWT strategy extracts the token from the Authorization Bearer header and
validates it against the configured secret.

[VERIFY: AE-AUTH-05] jwt.strategy.ts reads the secret from
process.env.JWT_SECRET without a fallback value.

## Guards

The JwtAuthGuard is a thin wrapper around Passport's built-in AuthGuard.
It is applied to all protected routes via the @UseGuards decorator.

[VERIFY: AE-AUTH-06] The JwtAuthGuard extends AuthGuard('jwt') from
@nestjs/passport.

## Auth Controller

The auth controller handles registration and login requests. It applies
a strict rate limit to prevent brute-force attacks on authentication
endpoints.

[VERIFY: AE-AUTH-07] The auth controller applies @Throttle({ default: { limit: 5, ttl: 60000 } })
for rate limiting.

## Auth Module

The auth module configures the JWT signing module and registers the
strategy and service providers.

[VERIFY: AE-AUTH-08] The auth module registers JwtModule with the secret
from process.env.JWT_SECRET and a defined expiration.

See also: [security.md](security.md) for rate limiting and CSP configuration.
