import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { TenantContextMiddleware } from './tenant-context.middleware';

describe('TenantContextMiddleware', () => {
  let middleware: TenantContextMiddleware;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $executeRaw: vi.fn().mockResolvedValue(undefined),
    };
    middleware = new TenantContextMiddleware(mockPrisma);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should throw UnauthorizedException when x-tenant-id header is missing', async () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = vi.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow(UnauthorizedException);
    expect(next).not.toHaveBeenCalled();
  });

  it('should set tenant context and call next when x-tenant-id is present', async () => {
    const req = { headers: { 'x-tenant-id': 'tenant-123' } } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware.use(req, res, next);

    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    expect(req.tenantId).toBe('tenant-123');
    expect(next).toHaveBeenCalled();
  });

  it('should call set_config with the tenant id', async () => {
    const req = { headers: { 'x-tenant-id': 'tenant-abc' } } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware.use(req, res, next);

    expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
  });

  it('should throw UnauthorizedException when x-tenant-id is undefined', async () => {
    const req = { headers: { 'x-tenant-id': undefined } } as any;
    const res = {} as any;
    const next = vi.fn();

    await expect(middleware.use(req, res, next)).rejects.toThrow('Missing x-tenant-id header');
  });
});
