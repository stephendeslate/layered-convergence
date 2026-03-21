import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

const mockJwtService = {
  sign: vi.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(
      mockPrisma as never,
      mockJwtService as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('should register a new buyer', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'buyer@test.com',
        role: Role.BUYER,
        password: 'hashed-password',
      });

      const result = await service.register({
        email: 'buyer@test.com',
        password: 'password123',
        role: Role.BUYER,
      });

      expect(result.token).toBe('mock-token');
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('buyer@test.com');
      expect(result.user.role).toBe(Role.BUYER);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should reject ADMIN role registration', async () => {
      await expect(
        service.register({
          email: 'admin@test.com',
          password: 'password123',
          role: Role.ADMIN,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'existing@test.com',
          password: 'password123',
          role: Role.SELLER,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        role: Role.BUYER,
        password: 'hashed-password',
      });
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.token).toBe('mock-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should reject invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject invalid password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: 'hashed-password',
      });
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@test.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
