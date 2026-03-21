import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { tenant: { findFirst: ReturnType<typeof vi.fn> }; user: { create: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn> } };
  let jwt: { signAsync: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    prisma = {
      tenant: { findFirst: vi.fn() },
      user: { create: vi.fn(), findFirst: vi.fn() },
    };
    jwt = { signAsync: vi.fn() };
    service = new AuthService(prisma as unknown as PrismaService, jwt as unknown as JwtService);
  });

  describe('register', () => {
    it('should throw NotFoundException when tenant does not exist', async () => {
      prisma.tenant.findFirst.mockResolvedValue(null);

      await expect(
        service.register({ email: 'a@b.com', password: 'password1', name: 'Test', tenantId: 'bad-id' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for ADMIN role', async () => {
      prisma.tenant.findFirst.mockResolvedValue({ id: 't1', name: 'Acme' });

      await expect(
        service.register({ email: 'a@b.com', password: 'password1', name: 'Test', tenantId: 't1', role: 'ADMIN' as never }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should hash password with bcrypt salt 12 and create user', async () => {
      prisma.tenant.findFirst.mockResolvedValue({ id: 't1', name: 'Acme' });
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-pw' as never);
      prisma.user.create.mockResolvedValue({
        id: 'u1', email: 'a@b.com', name: 'Test', tenantId: 't1', role: 'VIEWER', password: 'hashed-pw',
      });
      jwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.register({ email: 'a@b.com', password: 'password1', name: 'Test', tenantId: 't1' });

      expect(bcrypt.hash).toHaveBeenCalledWith('password1', 12);
      expect(result.token).toBe('jwt-token');
      expect(result.user.email).toBe('a@b.com');
      expect(result.user.role).toBe('VIEWER');
    });

    it('should allow ANALYST role registration', async () => {
      prisma.tenant.findFirst.mockResolvedValue({ id: 't1', name: 'Acme' });
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-pw' as never);
      prisma.user.create.mockResolvedValue({
        id: 'u1', email: 'a@b.com', name: 'Test', tenantId: 't1', role: 'ANALYST', password: 'hashed-pw',
      });
      jwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.register({ email: 'a@b.com', password: 'password1', name: 'Test', tenantId: 't1', role: 'ANALYST' });

      expect(result.user.role).toBe('ANALYST');
    });

    it('should return auth response with matching field names', async () => {
      prisma.tenant.findFirst.mockResolvedValue({ id: 't1', name: 'Acme' });
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-pw' as never);
      prisma.user.create.mockResolvedValue({
        id: 'u1', email: 'a@b.com', name: 'Test', tenantId: 't1', role: 'VIEWER', password: 'hashed-pw',
      });
      jwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.register({ email: 'a@b.com', password: 'password1', name: 'Test', tenantId: 't1' });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('tenantId');
      expect(result.user).toHaveProperty('role');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@b.com', password: 'password1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'a@b.com', password: 'hashed-pw', tenantId: 't1', role: 'VIEWER',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token on valid credentials using bcrypt.compare', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'u1', email: 'a@b.com', name: 'Test', password: 'hashed-pw', tenantId: 't1', role: 'VIEWER',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({ email: 'a@b.com', password: 'password1' });

      expect(bcrypt.compare).toHaveBeenCalledWith('password1', 'hashed-pw');
      expect(result.token).toBe('jwt-token');
      expect(result.user.id).toBe('u1');
    });
  });
});
