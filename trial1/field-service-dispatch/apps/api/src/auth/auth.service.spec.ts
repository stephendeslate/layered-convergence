import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$12$hashed-password'),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue('$2b$12$hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}));

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mock-uuid-token'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      company: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      refreshToken: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      customer: {
        findUnique: vi.fn(),
      },
      magicLink: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    jwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new company and admin user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.company.findUnique.mockResolvedValue(null);
      prisma.company.create.mockResolvedValue({
        id: 'company-1',
        users: [{
          id: 'user-1',
          role: 'ADMIN',
          email: 'admin@test.com',
        }],
      });
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register({
        companyName: 'Test Company',
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('refreshToken', 'mock-uuid-token');
      expect(result).toHaveProperty('expiresIn');
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          companyName: 'Test',
          email: 'existing@test.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        companyId: 'company-1',
        role: 'ADMIN',
        email: 'admin@test.com',
        passwordHash: '$2b$12$hashed',
        isActive: true,
        company: { id: 'company-1' },
      });
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'admin@test.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should rotate refresh tokens', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        token: 'old-token',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
        user: {
          id: 'user-1',
          companyId: 'company-1',
          role: 'ADMIN',
          email: 'admin@test.com',
          isActive: true,
        },
      });
      prisma.refreshToken.update.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh({ refreshToken: 'old-token' });
      expect(result).toHaveProperty('accessToken');
      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'token-1' },
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw for expired refresh token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        token: 'expired-token',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 86400000),
        user: { id: 'user-1', companyId: 'c1', role: 'ADMIN', email: 'a@a.com', isActive: true },
      });

      await expect(
        service.refresh({ refreshToken: 'expired-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke the refresh token', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      await service.logout('some-token');
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: 'some-token', revokedAt: null },
        }),
      );
    });
  });
});
