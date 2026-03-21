import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
}));

import * as bcrypt from 'bcrypt';

const mockPrisma = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
};

const mockConfig = {
  get: vi.fn((key: string, defaultVal?: string) => {
    const vals: Record<string, string> = { JWT_SECRET: 'test-secret', JWT_EXPIRATION: '3600' };
    return vals[key] || defaultVal;
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(mockPrisma as any, mockConfig as any);
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', name: 'Test', role: 'BUYER',
      });

      const result = await service.register({
        email: 'test@test.com', password: 'password123', name: 'Test',
      });

      expect(result.user.email).toBe('test@test.com');
      expect(result.token).toBeDefined();
    });

    it('should hash password before storing', async () => {
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', name: 'Test', role: 'BUYER',
      });

      await service.register({
        email: 'test@test.com', password: 'password123', name: 'Test',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw ConflictException on duplicate email', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002', clientVersion: '6.0.0',
      });
      mockPrisma.user.create.mockRejectedValue(error);

      await expect(service.register({
        email: 'dup@test.com', password: 'password123', name: 'Test',
      })).rejects.toThrow(ConflictException);
    });

    it('should default role to BUYER', async () => {
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', name: 'Test', role: 'BUYER',
      });

      await service.register({
        email: 'test@test.com', password: 'password123', name: 'Test',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'BUYER' }),
        }),
      );
    });
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', name: 'Test', role: 'BUYER',
        password: 'hashed', tenantId: 'default',
      });
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@test.com', password: 'password123',
      });

      expect(result.user.email).toBe('test@test.com');
      expect(result.token).toBeDefined();
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({
        email: 'unknown@test.com', password: 'password123',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', name: 'Test', role: 'BUYER',
        password: 'hashed', tenantId: 'default',
      });
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(service.login({
        email: 'test@test.com', password: 'wrong',
      })).rejects.toThrow(UnauthorizedException);
    });
  });
});
