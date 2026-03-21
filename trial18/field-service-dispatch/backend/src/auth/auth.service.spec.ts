import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { company: { create: ReturnType<typeof vi.fn> }; user: { create: ReturnType<typeof vi.fn>; findUnique: ReturnType<typeof vi.fn> } };
  let jwt: { sign: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    prisma = {
      company: { create: vi.fn() },
      user: { create: vi.fn(), findUnique: vi.fn() },
    };
    jwt = { sign: vi.fn().mockReturnValue('mock-token') };
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
    );
  });

  describe('register', () => {
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

    it('should hash password with bcrypt salt 12 and create user', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
      prisma.company.create.mockResolvedValue({ id: 'company-1', name: 'Test Co' });
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'tech@test.com',
        role: Role.TECHNICIAN,
        companyId: 'company-1',
        password: 'hashed-password',
      });

      const result = await service.register({
        email: 'tech@test.com',
        password: 'password123',
        name: 'Tech',
        role: Role.TECHNICIAN,
        companyName: 'Test Co',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('tech@test.com');
      expect(result.user.role).toBe(Role.TECHNICIAN);
    });

    it('should allow DISPATCHER registration', async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
      prisma.company.create.mockResolvedValue({ id: 'company-1', name: 'Test Co' });
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'dispatch@test.com',
        role: Role.DISPATCHER,
        companyId: 'company-1',
        password: 'hashed-password',
      });

      const result = await service.register({
        email: 'dispatch@test.com',
        password: 'password123',
        name: 'Dispatch',
        role: Role.DISPATCHER,
        companyName: 'Test Co',
      });

      expect(result.user.role).toBe(Role.DISPATCHER);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'tech@test.com',
        password: 'hashed-password',
        role: Role.TECHNICIAN,
        companyId: 'company-1',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'tech@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'tech@test.com',
        password: 'hashed-password',
        role: Role.TECHNICIAN,
        companyId: 'company-1',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({
        email: 'tech@test.com',
        password: 'password123',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result.token).toBe('mock-token');
      expect(result.user.id).toBe('user-1');
    });
  });
});
