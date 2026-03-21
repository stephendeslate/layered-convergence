import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantService } from './tenant.service.js';
import { NotFoundException } from '@nestjs/common';

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

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TenantService(mockPrisma as any);
  });

  describe('create', () => {
    it('should create a tenant with auto-generated apiKey', async () => {
      mockPrisma.tenant.create.mockResolvedValue({
        id: 'uuid-1',
        name: 'Acme',
        apiKey: 'ak_abc123',
      });
      const result = await service.create({ name: 'Acme' });
      expect(mockPrisma.tenant.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Acme',
          apiKey: expect.stringMatching(/^ak_/),
        }),
      });
      expect(result).toBeDefined();
    });

    it('should generate apiKey with ak_ prefix', async () => {
      mockPrisma.tenant.create.mockImplementation(({ data }) => data);
      const result = await service.create({ name: 'Test' });
      expect(result.apiKey).toMatch(/^ak_[a-f0-9]{32}$/);
    });
  });

  describe('findAll', () => {
    it('should return all tenants', async () => {
      mockPrisma.tenant.findMany.mockResolvedValue([
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
      ]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return tenant by id', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'uuid-1',
        name: 'Acme',
      });
      const result = await service.findOne('uuid-1');
      expect(result.name).toBe('Acme');
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByApiKey', () => {
    it('should return tenant by apiKey', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue({
        id: 'uuid-1',
        apiKey: 'ak_abc',
      });
      const result = await service.findByApiKey('ak_abc');
      expect(result.apiKey).toBe('ak_abc');
    });

    it('should throw NotFoundException if apiKey not found', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue(null);
      await expect(service.findByApiKey('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update tenant', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 'uuid-1' });
      mockPrisma.tenant.update.mockResolvedValue({
        id: 'uuid-1',
        name: 'Updated',
      });
      const result = await service.update('uuid-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);
      await expect(
        service.update('nonexistent', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete tenant', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 'uuid-1' });
      mockPrisma.tenant.delete.mockResolvedValue({ id: 'uuid-1' });
      const result = await service.remove('uuid-1');
      expect(result.id).toBe('uuid-1');
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);
      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('regenerateApiKey', () => {
    it('should regenerate apiKey', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 'uuid-1' });
      mockPrisma.tenant.update.mockImplementation(({ data }) => ({
        id: 'uuid-1',
        ...data,
      }));
      const result = await service.regenerateApiKey('uuid-1');
      expect(result.apiKey).toMatch(/^ak_/);
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);
      await expect(service.regenerateApiKey('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
