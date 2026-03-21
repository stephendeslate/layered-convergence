import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantContextMiddleware } from './tenant-context.middleware.js';
import { BadRequestException } from '@nestjs/common';

const mockPrisma = {
  tenant: {
    findFirst: vi.fn(),
  },
  $executeRaw: vi.fn(),
};

describe('TenantContextMiddleware', () => {
  let middleware: TenantContextMiddleware;
  const next = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    middleware = new TenantContextMiddleware(mockPrisma as any);
  });

  it('should throw BadRequestException if x-tenant-id is missing', async () => {
    const req = { headers: {} } as any;
    await expect(middleware.use(req, {} as any, next)).rejects.toThrow(
      BadRequestException,
    );
    await expect(middleware.use(req, {} as any, next)).rejects.toThrow(
      'x-tenant-id header is required',
    );
  });

  it('should throw BadRequestException if x-tenant-id is not a valid UUID', async () => {
    const req = { headers: { 'x-tenant-id': 'not-a-uuid' } } as any;
    await expect(middleware.use(req, {} as any, next)).rejects.toThrow(
      BadRequestException,
    );
    await expect(middleware.use(req, {} as any, next)).rejects.toThrow(
      'x-tenant-id must be a valid UUID',
    );
  });

  it('should throw BadRequestException if tenant not found', async () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    const req = { headers: { 'x-tenant-id': validUuid } } as any;
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    await expect(middleware.use(req, {} as any, next)).rejects.toThrow(
      BadRequestException,
    );
    await expect(middleware.use(req, {} as any, next)).rejects.toThrow(
      'Tenant not found',
    );
  });

  it('should set tenantId on request and call next', async () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    const req = { headers: { 'x-tenant-id': validUuid } } as any;
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: validUuid });
    mockPrisma.$executeRaw.mockResolvedValue(undefined);

    await middleware.use(req, {} as any, next);
    expect(req.tenantId).toBe(validUuid);
    expect(next).toHaveBeenCalled();
  });

  it('should call set_config with parameterized SQL', async () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    const req = { headers: { 'x-tenant-id': validUuid } } as any;
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: validUuid });
    mockPrisma.$executeRaw.mockResolvedValue(undefined);

    await middleware.use(req, {} as any, next);
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
  });

  it('should validate UUID format correctly', async () => {
    const invalidUuids = [
      'abc',
      '12345',
      'not-valid-uuid-format-here',
      '550e8400-e29b-41d4-a716',
    ];

    for (const uuid of invalidUuids) {
      const req = { headers: { 'x-tenant-id': uuid } } as any;
      await expect(middleware.use(req, {} as any, next)).rejects.toThrow(
        BadRequestException,
      );
    }
  });

  it('should accept valid UUID formats', async () => {
    const validUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const req = { headers: { 'x-tenant-id': validUuid } } as any;
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: validUuid });
    mockPrisma.$executeRaw.mockResolvedValue(undefined);

    await middleware.use(req, {} as any, next);
    expect(req.tenantId).toBe(validUuid);
  });
});
