import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  tenant: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(TenantService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tenant with an auto-generated apiKey', async () => {
      const dto = { name: 'Acme Corp' };
      mockPrisma.tenant.create.mockResolvedValue({
        id: 'uuid-1',
        ...dto,
        apiKey: 'ak_abc123',
      });

      const result = await service.create(dto);
      expect(mockPrisma.tenant.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Acme Corp',
          apiKey: expect.stringMatching(/^ak_/),
        }),
      });
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all tenants', async () => {
      const tenants = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }];
      mockPrisma.tenant.findMany.mockResolvedValue(tenants);

      const result = await service.findAll();
      expect(result).toEqual(tenants);
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      const tenant = { id: 'uuid-1', name: 'Acme' };
      mockPrisma.tenant.findUnique.mockResolvedValue(tenant);

      const result = await service.findOne('uuid-1');
      expect(result).toEqual(tenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByApiKey', () => {
    it('should return a tenant by apiKey', async () => {
      const tenant = { id: 'uuid-1', apiKey: 'ak_abc' };
      mockPrisma.tenant.findFirst.mockResolvedValue(tenant);

      const result = await service.findByApiKey('ak_abc');
      expect(result).toEqual(tenant);
    });

    it('should throw NotFoundException for invalid apiKey', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue(null);

      await expect(service.findByApiKey('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      const tenant = { id: 'uuid-1', name: 'Old' };
      mockPrisma.tenant.findUnique.mockResolvedValue(tenant);
      mockPrisma.tenant.update.mockResolvedValue({ ...tenant, name: 'New' });

      const result = await service.update('uuid-1', { name: 'New' });
      expect(result.name).toBe('New');
    });

    it('should throw NotFoundException if tenant to update does not exist', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a tenant', async () => {
      const tenant = { id: 'uuid-1', name: 'Acme' };
      mockPrisma.tenant.findUnique.mockResolvedValue(tenant);
      mockPrisma.tenant.delete.mockResolvedValue(tenant);

      const result = await service.remove('uuid-1');
      expect(result).toEqual(tenant);
    });

    it('should throw NotFoundException if tenant to remove does not exist', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('regenerateApiKey', () => {
    it('should regenerate the API key for a tenant', async () => {
      const tenant = { id: 'uuid-1', apiKey: 'ak_old' };
      mockPrisma.tenant.findUnique.mockResolvedValue(tenant);
      mockPrisma.tenant.update.mockResolvedValue({
        ...tenant,
        apiKey: 'ak_new123',
      });

      const result = await service.regenerateApiKey('uuid-1');
      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { apiKey: expect.stringMatching(/^ak_/) },
      });
      expect(result).toBeDefined();
    });
  });
});
