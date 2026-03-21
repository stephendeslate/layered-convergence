import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersController } from './users.controller';

const mockUsersService = {
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  const adminUser = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN', tenantId: 'tenant-1' };
  const buyerUser = { sub: 'buyer-1', email: 'buyer@test.com', role: 'BUYER', tenantId: 'tenant-1' };

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
    it('should call findById with user sub and tenantId', async () => {
      mockUsersService.findById.mockResolvedValue({ id: 'buyer-1' });
      await controller.getProfile(buyerUser as any);
      expect(mockUsersService.findById).toHaveBeenCalledWith('buyer-1', 'tenant-1');
    });
  });

  describe('findOne', () => {
    it('should call findById with id and tenantId', async () => {
      mockUsersService.findById.mockResolvedValue({ id: '1' });
      await controller.findOne('1', adminUser as any);
      expect(mockUsersService.findById).toHaveBeenCalledWith('1', 'tenant-1');
    });
  });

  describe('update', () => {
    it('should call update with id, dto, and tenantId', async () => {
      mockUsersService.update.mockResolvedValue({ id: '1', name: 'New' });
      await controller.update('1', { name: 'New' } as any, adminUser as any);
      expect(mockUsersService.update).toHaveBeenCalledWith('1', { name: 'New' }, 'tenant-1');
    });
  });

  describe('remove', () => {
    it('should call remove with id and tenantId', async () => {
      mockUsersService.remove.mockResolvedValue({ deleted: true });
      await controller.remove('1', adminUser as any);
      expect(mockUsersService.remove).toHaveBeenCalledWith('1', 'tenant-1');
    });
  });
});
