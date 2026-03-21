import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let prisma: any;

  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    apiKey: 'api-key-1',
    primaryColor: '#000',
    fontFamily: null,
    logoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      tenant: {
        create: vi.fn().mockResolvedValue(mockTenant),
        findMany: vi.fn().mockResolvedValue([mockTenant]),
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue(mockTenant),
        delete: vi.fn().mockResolvedValue(mockTenant),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tenant with a generated apiKey', async () => {
      const result = await service.create({ name: 'Test Tenant' });
      expect(prisma.tenant.create).toHaveBeenCalled();
      expect(result).toEqual(mockTenant);
    });

    it('should pass branding fields', async () => {
      await service.create({ name: 'Test', primaryColor: '#fff', fontFamily: 'Arial' });
      expect(prisma.tenant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ primaryColor: '#fff', fontFamily: 'Arial' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return array of tenants', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return tenant when found', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      const result = await service.findById('tenant-1');
      expect(result.id).toBe('tenant-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByApiKey', () => {
    it('should find by apiKey', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      const result = await service.findByApiKey('api-key-1');
      expect(result).toEqual(mockTenant);
    });

    it('should return null when apiKey not found', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);
      const result = await service.findByApiKey('bad-key');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update tenant', async () => {
      const result = await service.update('tenant-1', { name: 'Updated' });
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: { name: 'Updated' },
      });
      expect(result).toEqual(mockTenant);
    });
  });

  describe('remove', () => {
    it('should delete tenant', async () => {
      await service.remove('tenant-1');
      expect(prisma.tenant.delete).toHaveBeenCalledWith({ where: { id: 'tenant-1' } });
    });
  });
});
