# Performance Specification — Field Service Dispatch

## Response Time Tracking

ResponseTimeInterceptor registered as APP_INTERCEPTOR in AppModule:
- Uses performance.now() from perf_hooks for precise timing
- Sets X-Response-Time header on every response (e.g., "12.34ms")
- Records timing to MetricsService for operational visibility

## Pagination

### MAX_PAGE_SIZE Clamping

- MAX_PAGE_SIZE = 100 (from packages/shared)
- normalizePageParams() clamps pageSize to [1, 100] range
- Pages clamped to minimum of 1
- Default page: 1, default pageSize: 20
- Clamping (not rejection) prevents 400 errors for large requests

### Pagination Response Format

All list endpoints return:
```
{ data: T[], total, page, pageSize, totalPages }
```

## Database Optimization

### Prisma Select/Include

- Domain services use include for related data (N+1 prevention)
- Auth service uses select to limit returned columns
- findOne methods include related entities in single query

### Database Indexes

All models have composite and single-column indexes:
- Tenant FK indexes on all tables (tenantId)
- Status indexes for filtered queries
- Composite (tenantId + status) for tenant-scoped status queries
- technicianId and workOrderId on schedules for join queries

### Connection Pooling

- connection_limit=10 in DATABASE_URL
- PrismaService lifecycle managed via onModuleInit/onModuleDestroy

## Caching

### Cache-Control Headers

- Service areas list: Cache-Control: public, max-age=60
- Other list endpoints: no cache (real-time data)

## Frontend Bundle Optimization

### next/dynamic

- Table components loaded dynamically on list pages
- Reduces initial bundle size for faster page loads

## Health Endpoint Performance

- GET /health responds without database queries (< 50ms target)
- GET /health/ready checks database with single SELECT 1 query

## Monitoring Metrics

MetricsService tracks in-memory:
- Total request count
- Total error count
- Average response time
- Uptime

## Cross-References

- See [architecture.md](./architecture.md) for system design
- See [data-model.md](./data-model.md) for index definitions
- See [monitoring.md](./monitoring.md) for metrics endpoint
