import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> } };
  let jwtService: { sign: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
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
    it('should register a new BUYER user with bcrypt-hashed password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'buyer@test.com',
        role: 'BUYER',
        password: 'hashed-password',
      });

      const result = await service.register({
        email: 'buyer@test.com',
        password: 'password123',
        role: 'BUYER',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: { id: 'user-1', email: 'buyer@test.com', role: 'BUYER' },
      });
    });

    it('should register a new SELLER user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
      prisma.user.create.mockResolvedValue({
        id: 'user-2',
        email: 'seller@test.com',
        role: 'SELLER',
        password: 'hashed-password',
      });

      const result = await service.register({
        email: 'seller@test.com',
        password: 'password123',
        role: 'SELLER',
      });

      expect(result.user.role).toBe('SELLER');
    });

    it('should reject ADMIN role registration', async () => {
      await expect(
        service.register({
          email: 'admin@test.com',
          password: 'password123',
          role: 'ADMIN' as 'BUYER' | 'SELLER',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'existing@test.com',
          password: 'password123',
          role: 'BUYER',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should return auth response with token field', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        role: 'BUYER',
        password: 'hashed',
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        role: 'BUYER',
      });

      expect(result).toHaveProperty('token');
      expect(result).not.toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('role');
    });
  });

  describe('login', () => {
    it('should login with valid credentials using bcrypt.compare', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: 'hashed-password',
        role: 'BUYER',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: { id: 'user-1', email: 'test@test.com', role: 'BUYER' },
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no@test.com', password: 'pwd' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: 'hashed-password',
        role: 'BUYER',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
