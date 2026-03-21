import { TenantContextMiddleware } from './tenant-context.middleware.js';
import { BadRequestException } from '@nestjs/common';

describe('TenantContextMiddleware', () => {
  let middleware: TenantContextMiddleware;
  let mockPrisma: any;
  const mockNext = vi.fn();

  beforeEach(() => {
    mockPrisma = {
      tenant: {
        findFirst: vi.fn(),
      },
      $executeRaw: vi.fn(),
    };
    middleware = new TenantContextMiddleware(mockPrisma);
    mockNext.mockClear();
  });

  it('should throw if x-tenant-id is missing', async () => {
    const req = { headers: {} } as any;
    await expect(middleware.use(req, {} as any, mockNext)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw if x-tenant-id is not a valid UUID', async () => {
    const req = { headers: { 'x-tenant-id': 'not-a-uuid' } } as any;
    await expect(middleware.use(req, {} as any, mockNext)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw if tenant not found', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null);
    const req = {
      headers: { 'x-tenant-id': '550e8400-e29b-41d4-a716-446655440000' },
    } as any;
    await expect(middleware.use(req, {} as any, mockNext)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should set tenantId on request and call next', async () => {
    const tenantId = '550e8400-e29b-41d4-a716-446655440000';
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: tenantId });
    mockPrisma.$executeRaw.mockResolvedValue(undefined);
    const req = { headers: { 'x-tenant-id': tenantId } } as any;
    await middleware.use(req, {} as any, mockNext);
    expect(req.tenantId).toBe(tenantId);
    expect(mockNext).toHaveBeenCalled();
  });
});
