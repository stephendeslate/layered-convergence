import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        role: 'BUYER' as const,
        tenantId: 'tenant-1',
      };
      prisma.user.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return users for tenant', async () => {
      const users = [
        { id: '1', email: 'a@test.com', name: 'A', role: 'BUYER', tenantId: 't1' },
      ];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.findAll('t1');

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
        select: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    it('should return user if found', async () => {
      const user = { id: '1', email: 'a@test.com', tenantId: 't1' };
      prisma.user.findFirst.mockResolvedValue(user);

      const result = await service.findOne('1', 't1');

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 't1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = { id: '1', email: 'test@test.com' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('test@test.com');

      expect(result).toEqual(user);
    });

    it('should return null if not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('none@test.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });
      prisma.user.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', 't1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.update('1', 't1', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });
      prisma.user.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', 't1');

      expect(result).toEqual({ id: '1' });
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.remove('1', 't1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
