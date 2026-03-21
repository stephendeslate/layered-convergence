import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';

vi.stubEnv('JWT_SECRET', 'test-secret-for-unit-tests');

const mockPrisma = {
  company: { create: vi.fn() },
  user: { create: vi.fn(), findFirst: vi.fn() },
};

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('mock-jwt-token'),
  verify: vi.fn(),
}));

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should create a company and user, return token', async () => {
      mockPrisma.company.create.mockResolvedValue({ id: 'company-1', name: 'Test Co' });
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        companyId: 'company-1',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        companyName: 'Test Co',
      });

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe('ADMIN');
      expect(mockPrisma.company.create).toHaveBeenCalledWith({ data: { name: 'Test Co' } });
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'ADMIN',
        companyId: 'company-1',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
        companyId: 'company-1',
      });

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong',
          companyId: 'company-1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: 'correct-password',
        name: 'Test User',
        role: 'ADMIN',
        companyId: 'company-1',
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
          companyId: 'company-1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
