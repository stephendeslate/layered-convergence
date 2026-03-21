import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(),
  verify: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> } };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    role: Role.BUYER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };

    service = new AuthService(prisma as unknown as PrismaService);
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue(mockUser);
      (jwt.sign as ReturnType<typeof vi.fn>).mockReturnValue('mock-token');

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: Role.BUYER,
      });

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.id).toBe('user-1');
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: Role.BUYER,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash the password before storing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue(mockUser);
      (jwt.sign as ReturnType<typeof vi.fn>).mockReturnValue('token');

      await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: Role.BUYER,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should return user without passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as ReturnType<typeof vi.fn>).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue(mockUser);
      (jwt.sign as ReturnType<typeof vi.fn>).mockReturnValue('token');

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: Role.BUYER,
      });

      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
      (jwt.sign as ReturnType<typeof vi.fn>).mockReturnValue('mock-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not reveal whether user exists in error message', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      try {
        await service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      } catch (err) {
        expect((err as UnauthorizedException).message).toBe('Invalid credentials');
      }
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { sub: 'user-1', email: 'test@example.com', role: Role.BUYER };
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValue(payload);

      const result = service.verifyToken('valid-token');
      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException for invalid token', () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('invalid token');
      });

      expect(() => service.verifyToken('invalid-token')).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired token', () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => service.verifyToken('expired-token')).toThrow(UnauthorizedException);
    });
  });
});
