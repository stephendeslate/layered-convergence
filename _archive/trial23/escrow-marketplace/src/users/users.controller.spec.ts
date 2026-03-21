import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersController } from './users.controller';
import { UserRole } from '@prisma/client';
import { RequestUser } from '../common/interfaces/request-user.interface';

const mockService = {
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  const adminUser: RequestUser = { sub: 'admin-1', email: 'admin@test.com', role: UserRole.ADMIN, tenantId: 'tenant-1' };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new UsersController(mockService as any);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockService.findAll.mockResolvedValue([{ id: 'u-1' }]);
      const result = await controller.findAll(adminUser);
      expect(result).toHaveLength(1);
    });
  });

  describe('getProfile', () => {
    it('should return current user profile', async () => {
      mockService.findById.mockResolvedValue({ id: 'admin-1' });
      const result = await controller.getProfile(adminUser);
      expect(result.id).toBe('admin-1');
      expect(mockService.findById).toHaveBeenCalledWith('admin-1', 'tenant-1');
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockService.findById.mockResolvedValue({ id: 'u-1' });
      const result = await controller.findOne('u-1', adminUser);
      expect(result.id).toBe('u-1');
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      mockService.update.mockResolvedValue({ id: 'u-1', name: 'Updated' });
      const result = await controller.update('u-1', { name: 'Updated' }, adminUser);
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      mockService.remove.mockResolvedValue({ deleted: true });
      const result = await controller.remove('u-1', adminUser);
      expect(result.deleted).toBe(true);
    });
  });
});
