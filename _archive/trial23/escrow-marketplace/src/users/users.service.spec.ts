import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

const mockPrisma = {
  user: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UsersService(mockPrisma as any);
  });

  describe('findAll', () => {
    it('should return users for tenant', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'u-1', name: 'Test' }]);
      const result = await service.findAll('tenant-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u-1', name: 'Test' });
      const result = await service.findById('u-1', 'tenant-1');
      expect(result.id).toBe('u-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.findById('u-999', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u-1', email: 'test@test.com' });
      const result = await service.findByEmail('test@test.com');
      expect(result?.email).toBe('test@test.com');
    });

    it('should return null when email not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.findByEmail('missing@test.com');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u-1' });
      mockPrisma.user.update.mockResolvedValue({ id: 'u-1', name: 'Updated' });
      const result = await service.update('u-1', { name: 'Updated' }, 'tenant-1');
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when user not found for update', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.update('u-999', { name: 'Updated' }, 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u-1' });
      mockPrisma.user.delete.mockResolvedValue({});
      const result = await service.remove('u-1', 'tenant-1');
      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException when user not found for delete', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.remove('u-999', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });
});
