import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersController } from './users.controller';

const mockUsersService = {
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const adminUser = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN', tenantId: 'tenant-1' };
const regularUser = { sub: 'user-1', email: 'user@test.com', role: 'BUYER', tenantId: 'tenant-1' };

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new UsersController(mockUsersService as any);
  });

  describe('findAll', () => {
    it('should call usersService.findAll with tenantId', async () => {
      mockUsersService.findAll.mockResolvedValue([]);
      await controller.findAll(adminUser as any);
      expect(mockUsersService.findAll).toHaveBeenCalledWith('tenant-1');
    });
  });

  describe('getProfile', () => {
    it('should return the current user profile', async () => {
      mockUsersService.findById.mockResolvedValue({ id: 'user-1', name: 'User' });
      const result = await controller.getProfile(regularUser as any);
      expect(mockUsersService.findById).toHaveBeenCalledWith('user-1', 'tenant-1');
      expect(result).toHaveProperty('id');
    });
  });

  describe('findOne', () => {
    it('should call usersService.findById', async () => {
      mockUsersService.findById.mockResolvedValue({ id: '123' });
      await controller.findOne('123', adminUser as any);
      expect(mockUsersService.findById).toHaveBeenCalledWith('123', 'tenant-1');
    });
  });

  describe('update', () => {
    it('should call usersService.update', async () => {
      mockUsersService.update.mockResolvedValue({ id: '123', name: 'New' });
      await controller.update('123', { name: 'New' }, adminUser as any);
      expect(mockUsersService.update).toHaveBeenCalledWith('123', { name: 'New' }, 'tenant-1');
    });
  });

  describe('remove', () => {
    it('should call usersService.remove', async () => {
      mockUsersService.remove.mockResolvedValue({ deleted: true });
      const result = await controller.remove('123', adminUser as any);
      expect(result).toEqual({ deleted: true });
    });
  });
});
