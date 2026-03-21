import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

const mockPrisma = {
  company: { create: vi.fn() },
  user: { create: vi.fn(), findUnique: vi.fn() },
};

const mockJwtService = {
  sign: vi.fn().mockReturnValue('mock-token'),
};

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      mockPrisma as never,
      mockJwtService as never,
    );
  });

  describe('register', () => {
    it('should register a DISPATCHER user successfully', async () => {
      mockPrisma.company.create.mockResolvedValue({ id: 'company-1', name: 'Test Co' });
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        role: Role.DISPATCHER,
        companyId: 'company-1',
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        role: Role.DISPATCHER,
        companyName: 'Test Co',
      });

      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
      expect(result.user.role).toBe(Role.DISPATCHER);
      expect(result.user.companyId).toBe('company-1');
    });

    it('should register a TECHNICIAN user successfully', async () => {
      mockPrisma.company.create.mockResolvedValue({ id: 'company-1', name: 'Test Co' });
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'tech@test.com',
        role: Role.TECHNICIAN,
        companyId: 'company-1',
      });

      const result = await service.register({
        email: 'tech@test.com',
        password: 'password123',
        name: 'Tech User',
        role: Role.TECHNICIAN,
        companyName: 'Test Co',
      });

      expect(result.user.role).toBe(Role.TECHNICIAN);
    });

    it('should reject ADMIN role registration', async () => {
      await expect(
        service.register({
          email: 'admin@test.com',
          password: 'password123',
          name: 'Admin',
          role: Role.ADMIN,
          companyName: 'Test Co',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: 'hashed-password',
        role: Role.DISPATCHER,
        companyId: 'company-1',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.token).toBe('mock-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should throw on invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw on wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: 'hashed-password',
        role: Role.DISPATCHER,
        companyId: 'company-1',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
