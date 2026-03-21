import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

// Mock bcrypt
vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('mock-jwt-token'),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    company: {
      create: ReturnType<typeof vi.fn>;
    };
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    role: 'ADMIN',
    companyId: 'company-1',
  };

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      company: {
        create: vi.fn(),
      },
    };
    service = new AuthService(prisma as unknown as PrismaService);
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.company.create.mockResolvedValue({ id: 'company-1', name: 'Test Co' });
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        companyName: 'Test Co',
      });

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should create a company for the new user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.company.create.mockResolvedValue({ id: 'company-1', name: 'Test Co' });
      prisma.user.create.mockResolvedValue(mockUser);

      await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        companyName: 'Test Co',
      });

      expect(prisma.company.create).toHaveBeenCalledWith({
        data: { name: 'Test Co' },
      });
    });

    it('should set role to ADMIN for new registrations', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.company.create.mockResolvedValue({ id: 'company-1', name: 'Test Co' });
      prisma.user.create.mockResolvedValue(mockUser);

      await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        companyName: 'Test Co',
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: 'ADMIN' }),
        }),
      );
    });

    it('should throw ConflictException if email exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
          companyName: 'Co',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash the password', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.company.create.mockResolvedValue({ id: 'company-1', name: 'Co' });
      prisma.user.create.mockResolvedValue(mockUser);

      await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        companyName: 'Co',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should not expose password in response', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.company.create.mockResolvedValue({ id: 'company-1', name: 'Co' });
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        companyName: 'Co',
      });

      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not expose password in response', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user).not.toHaveProperty('password');
    });

    it('should include companyId in response', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.companyId).toBe('company-1');
    });
  });
});
