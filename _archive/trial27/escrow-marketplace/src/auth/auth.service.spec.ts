import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('mock-token'),
}));

const mockPrisma = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
};

const mockConfig = {
  get: vi.fn((key: string, defaultVal?: string) => {
    if (key === 'JWT_SECRET') return 'test-secret';
    if (key === 'JWT_EXPIRATION') return '3600';
    return defaultVal;
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(mockPrisma as any, mockConfig as any);
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      (bcrypt.hash as any).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: '1', email: 'test@test.com', name: 'Test', role: 'BUYER', tenantId: 'default',
      });

      const result = await service.register({
        email: 'test@test.com', password: 'password123', name: 'Test',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    it('should throw on duplicate email', async () => {
      (bcrypt.hash as any).mockResolvedValue('hashed');
      const prismaError = new Error('Unique constraint failed');
      Object.assign(prismaError, { code: 'P2002', clientVersion: '6.0.0' });
      mockPrisma.user.create.mockRejectedValue(prismaError);

      await expect(service.register({
        email: 'dup@test.com', password: 'password123', name: 'Dup',
      })).rejects.toThrow();
    });

    it('should use BUYER as default role', async () => {
      (bcrypt.hash as any).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({
        id: '1', email: 'test@test.com', name: 'Test', role: 'BUYER', tenantId: 'default',
      });

      await service.register({ email: 'test@test.com', password: 'password123', name: 'Test' });

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.role).toBe('BUYER');
    });

    it('should use provided role', async () => {
      (bcrypt.hash as any).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({
        id: '1', email: 'admin@test.com', name: 'Admin', role: 'ADMIN', tenantId: 'default',
      });

      await service.register({
        email: 'admin@test.com', password: 'password123', name: 'Admin', role: 'ADMIN' as any,
      });

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.role).toBe('ADMIN');
    });

    it('should generate a JWT token', async () => {
      (bcrypt.hash as any).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({
        id: '1', email: 'test@test.com', name: 'Test', role: 'BUYER', tenantId: 'default',
      });

      const result = await service.register({
        email: 'test@test.com', password: 'password123', name: 'Test',
      });

      expect(jwt.sign).toHaveBeenCalled();
      expect(result.token).toBe('mock-token');
    });
  });

  describe('login', () => {
    it('should return user and token on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1', email: 'test@test.com', name: 'Test', role: 'BUYER',
        password: 'hashed', tenantId: 'default',
      });
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login({ email: 'test@test.com', password: 'password123' });

      expect(result).toHaveProperty('token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1', email: 'test@test.com', name: 'Test', role: 'BUYER',
        password: 'hashed', tenantId: 'default',
      });
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should exclude password from returned user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1', email: 'test@test.com', name: 'Test', role: 'BUYER',
        password: 'hashed', tenantId: 'default',
      });
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login({ email: 'test@test.com', password: 'password123' });
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('test@test.com');
    });
  });
});
