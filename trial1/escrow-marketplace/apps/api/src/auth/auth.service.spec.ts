import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('$2b$04$hashed_password'),
  compare: vi.fn(),
}));

const mockPrismaService = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

const mockJwtService = {
  signAsync: vi.fn(),
  verify: vi.fn(),
};

const mockConfigService = {
  get: vi.fn().mockReturnValue('24h'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      mockPrismaService as any,
      mockJwtService as any,
      mockConfigService as any,
    );
    mockJwtService.signAsync.mockResolvedValue('mock-token');
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        displayName: 'Test User',
        role: 'BUYER',
        emailVerified: false,
        createdAt: new Date('2026-01-01'),
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'Password123',
        displayName: 'Test User',
        role: 'BUYER' as any,
      });

      expect(result.user.email).toBe('test@test.com');
      expect(result.tokens.accessToken).toBe('mock-token');
      expect(result.tokens.refreshToken).toBe('mock-token');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'existing@test.com',
          password: 'Password123',
          displayName: 'Test',
          role: 'BUYER' as any,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@test.com',
      passwordHash: '$2b$04$hashed',
      displayName: 'Test User',
      role: 'BUYER',
      emailVerified: true,
      createdAt: new Date('2026-01-01'),
    };

    it('should login with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@test.com',
        password: 'Password123',
      });

      expect(result.user.email).toBe('test@test.com');
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh a valid token', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'user-1',
        email: 'test@test.com',
        role: 'BUYER',
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        role: 'BUYER',
      });

      const result = await service.refreshToken({
        refreshToken: 'valid-refresh-token',
      });

      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(
        service.refreshToken({ refreshToken: 'invalid' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
