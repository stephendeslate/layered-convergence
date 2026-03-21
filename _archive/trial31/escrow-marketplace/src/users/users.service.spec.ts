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
    it('should return users for given tenant', async () => {
      const users = [{ id: '1', email: 'a@test.com', name: 'A', role: 'BUYER' }];
      mockPrisma.user.findMany.mockResolvedValue(users);

      const result = await service.findAll('tenant-1');

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      expect(result).toEqual(users);
    });

    it('should return empty array when no users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      const result = await service.findAll('tenant-1');
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = { id: '1', email: 'a@test.com', name: 'A', role: 'BUYER' };
      mockPrisma.user.findFirst.mockResolvedValue(user);

      const result = await service.findById('1', 'tenant-1');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.findById('999', 'tenant-1')).rejects.toThrow(NotFoundException);
    });

    it('should filter by both id and tenantId', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1' });
      await service.findById('1', 'tenant-1');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: '1', tenantId: 'tenant-1' },
        select: expect.any(Object),
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const user = { id: '1', email: 'a@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('a@test.com');
      expect(result).toEqual(user);
    });

    it('should return null when email not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.findByEmail('none@test.com');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user after verifying existence', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.user.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', { name: 'Updated' }, 'tenant-1');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated' },
        select: expect.any(Object),
      });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.update('999', { name: 'X' }, 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete user and return confirmation', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.user.delete.mockResolvedValue({});

      const result = await service.remove('1', 'tenant-1');
      expect(result).toEqual({ deleted: true });
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.remove('999', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });
});
