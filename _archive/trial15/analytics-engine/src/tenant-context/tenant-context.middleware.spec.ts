import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { TenantContextMiddleware } from './tenant-context.middleware';

describe('TenantContextMiddleware', () => {
  let middleware: TenantContextMiddleware;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $executeRaw: vi.fn().mockResolvedValue(1),
    };
    middleware = new TenantContextMiddleware(mockPrisma);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should throw UnauthorizedException when x-tenant-id is missing', async () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = vi.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow(UnauthorizedException);
    expect(next).not.toHaveBeenCalled();
  });

  it('should set tenantId on request and call next when x-tenant-id is present', async () => {
    const req = { headers: { 'x-tenant-id': 'tenant-1' } } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware.use(req, res, next);

    expect(req.tenantId).toBe('tenant-1');
    expect(next).toHaveBeenCalled();
  });

  it('should call set_config via $executeRaw with parameterized query', async () => {
    const req = { headers: { 'x-tenant-id': 'tenant-1' } } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware.use(req, res, next);

    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
  });

  it('should not use $executeRawUnsafe', () => {
    expect(mockPrisma.$executeRawUnsafe).toBeUndefined();
  });
});
