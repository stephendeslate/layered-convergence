import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TenantContextMiddleware } from './tenant-context.middleware.js';
import { PrismaService } from '../../prisma/prisma.service.js';

const mockPrisma = {
  tenant: { findFirst: vi.fn() },
  $executeRaw: vi.fn(),
};

describe('TenantContextMiddleware', () => {
  let middleware: TenantContextMiddleware;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TenantContextMiddleware,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    middleware = module.get(TenantContextMiddleware);
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should throw BadRequestException if x-tenant-id header is missing', async () => {
    const req = { headers: {} } as any;
    const res = {} as any;

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      BadRequestException,
    );
    await expect(middleware.use(req, res, next)).rejects.toThrow(
      'x-tenant-id header is required',
    );
  });

  it('should throw BadRequestException if x-tenant-id is not a valid UUID', async () => {
    const req = { headers: { 'x-tenant-id': 'not-a-uuid' } } as any;
    const res = {} as any;

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      BadRequestException,
    );
    await expect(middleware.use(req, res, next)).rejects.toThrow(
      'x-tenant-id must be a valid UUID',
    );
  });

  it('should throw BadRequestException if tenant not found', async () => {
    const tenantId = '550e8400-e29b-41d4-a716-446655440000';
    const req = { headers: { 'x-tenant-id': tenantId } } as any;
    const res = {} as any;
    mockPrisma.tenant.findFirst.mockResolvedValue(null);

    await expect(middleware.use(req, res, next)).rejects.toThrow(
      BadRequestException,
    );
    await expect(middleware.use(req, res, next)).rejects.toThrow(
      'Tenant not found',
    );
  });

  it('should set tenantId on request and call next when tenant exists', async () => {
    const tenantId = '550e8400-e29b-41d4-a716-446655440000';
    const req = { headers: { 'x-tenant-id': tenantId } } as any;
    const res = {} as any;
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: tenantId });
    mockPrisma.$executeRaw.mockResolvedValue(undefined);

    await middleware.use(req, res, next);

    expect(req.tenantId).toBe(tenantId);
    expect(next).toHaveBeenCalled();
  });

  it('should call set_config with the tenant ID', async () => {
    const tenantId = '550e8400-e29b-41d4-a716-446655440000';
    const req = { headers: { 'x-tenant-id': tenantId } } as any;
    const res = {} as any;
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: tenantId });
    mockPrisma.$executeRaw.mockResolvedValue(undefined);

    await middleware.use(req, res, next);

    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
  });

  it('should accept case-insensitive UUIDs', async () => {
    const tenantId = '550E8400-E29B-41D4-A716-446655440000';
    const req = { headers: { 'x-tenant-id': tenantId } } as any;
    const res = {} as any;
    mockPrisma.tenant.findFirst.mockResolvedValue({ id: tenantId });
    mockPrisma.$executeRaw.mockResolvedValue(undefined);

    await middleware.use(req, res, next);

    expect(req.tenantId).toBe(tenantId);
    expect(next).toHaveBeenCalled();
  });
});
