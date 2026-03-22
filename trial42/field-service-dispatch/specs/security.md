# Security Specification — Field Service Dispatch

## Content Security Policy (Helmet)

Helmet.js middleware applied in main.ts bootstrap:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

## CORS Configuration

- Origin: from CORS_ORIGIN environment variable (no fallback)
- Credentials: true
- Allowed headers: Content-Type, Authorization, X-Correlation-ID
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS

## Rate Limiting (ThrottlerModule)

- Default: 100 requests per 60 seconds
- Auth endpoints: 5 requests per 60 seconds
- Registered as APP_GUARD in AppModule providers
- Health/metrics endpoints skip throttle via @SkipThrottle()

## Input Validation

### ValidationPipe Configuration
- whitelist: true (strip unknown properties)
- forbidNonWhitelisted: true (reject unknown properties)
- transform: true (auto-transform types)

### DTO Validation Rules
- All string fields: @IsString() + @MaxLength()
- All UUID fields: @MaxLength(36)
- Status enums: @IsString() + @MaxLength() + @IsIn()
- Email fields: @IsEmail() + @MaxLength(255)
- Registration role: @IsIn(ALLOWED_REGISTRATION_ROLES) excludes ADMIN

## Environment Variable Security

- validateEnvVars() called at startup for DATABASE_URL, JWT_SECRET, CORS_ORIGIN
- No hardcoded secret fallbacks anywhere in the codebase
- .env.example documents required variables without values

## Error Response Sanitization

- GlobalExceptionFilter as APP_FILTER (not main.ts)
- Stack traces never exposed in HTTP responses
- Client receives only: { statusCode, message, timestamp }
- T42 variation: request body sanitized before logging (password/token redacted)

## SQL Injection Prevention

- All database access via Prisma ORM parameterized queries
- Zero $executeRawUnsafe usage
- $queryRaw used only with Prisma.sql tagged template

## XSS Prevention

- Zero dangerouslySetInnerHTML usage in frontend
- CSP headers restrict script sources
- Input validation on all API endpoints

## Dependency Auditing

- pnpm audit --audit-level=high in CI pipeline
- Regular dependency updates via Dependabot/Renovate

## Cross-References

- See [authentication.md](./authentication.md) for JWT and bcrypt details
- See [api-contracts.md](./api-contracts.md) for endpoint validation rules
- See [monitoring.md](./monitoring.md) for error tracking and logging
