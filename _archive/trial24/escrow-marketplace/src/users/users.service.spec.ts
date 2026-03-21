import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';

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
    it('should return users filtered by tenantId', async () => {
      const users = [{ id: '1', email: 'a@a.com', name: 'A', role: 'BUYER', createdAt: new Date() }];
      mockPrisma.user.findMany.mockResolvedValue(users);

      const result = await service.findAll('tenant-1');

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(result).toEqual(users);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = { id: '1', email: 'a@a.com', name: 'A', role: 'BUYER' };
      mockPrisma.user.findFirst.mockResolvedValue(user);

      const result = await service.findById('1', 'tenant-1');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.findById('999', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = { id: '1', email: 'a@a.com', name: 'A', role: 'BUYER' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('a@a.com');
      expect(result).toEqual(user);
    });

    it('should return null when email not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('none@none.com');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user after verifying existence', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.user.update.mockResolvedValue({ id: '1', name: 'Updated', role: 'BUYER' });

      const result = await service.update('1', { name: 'Updated' }, 'tenant-1');
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.update('999', { name: 'X' }, 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete user and return deleted flag', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.user.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', 'tenant-1');
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.remove('999', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });
});
