import { TenantService } from './tenant.service.js';
import { NotFoundException } from '@nestjs/common';

describe('TenantService', () => {
  let service: TenantService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      tenant: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new TenantService(mockPrisma);
  });

  describe('create', () => {
    it('should create a tenant with generated apiKey', async () => {
      mockPrisma.tenant.create.mockResolvedValue({
        id: '1',
        name: 'Test',
        apiKey: 'ak_test',
      });
      const result = await service.create({ name: 'Test' });
      expect(mockPrisma.tenant.create).toHaveBeenCalled();
      const callArg = mockPrisma.tenant.create.mock.calls[0][0];
      expect(callArg.data.name).toBe('Test');
      expect(callArg.data.apiKey).toMatch(/^ak_/);
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all tenants', async () => {
      mockPrisma.tenant.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: '1', name: 'T' });
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByApiKey', () => {
    it('should find tenant by API key', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue({
        id: '1',
        apiKey: 'ak_test',
      });
      const result = await service.findByApiKey('ak_test');
      expect(result.apiKey).toBe('ak_test');
    });

    it('should throw NotFoundException if API key not found', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue(null);
      await expect(service.findByApiKey('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.tenant.update.mockResolvedValue({
        id: '1',
        name: 'Updated',
      });
      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a tenant', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.tenant.delete.mockResolvedValue({ id: '1' });
      await service.remove('1');
      expect(mockPrisma.tenant.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('regenerateApiKey', () => {
    it('should generate a new API key', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.tenant.update.mockResolvedValue({
        id: '1',
        apiKey: 'ak_new',
      });
      const result = await service.regenerateApiKey('1');
      const callArg = mockPrisma.tenant.update.mock.calls[0][0];
      expect(callArg.data.apiKey).toMatch(/^ak_/);
      expect(result).toBeDefined();
    });
  });
});
