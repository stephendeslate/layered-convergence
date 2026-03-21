import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: any; create: any } };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('should create a user and return token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'password123',
        role: 'BUYER',
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        role: 'BUYER' as any,
      });

      expect(result.email).toBe('test@test.com');
      expect(result.token).toBeDefined();
      expect(result.role).toBe('BUYER');
    });

    it('should throw ConflictException if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          role: 'BUYER' as any,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should generate valid base64 token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        email: 'user@example.com',
        password: 'secret123',
        role: 'PROVIDER',
      });

      const result = await service.register({
        email: 'user@example.com',
        password: 'secret123',
        role: 'PROVIDER' as any,
      });

      const decoded = Buffer.from(result.token, 'base64').toString('utf-8');
      expect(decoded).toBe('user@example.com:secret123');
    });

    it('should return the user id', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'uuid-123',
        email: 'a@b.com',
        password: 'pw1234',
        role: 'ADMIN',
      });

      const result = await service.register({
        email: 'a@b.com',
        password: 'pw1234',
        role: 'ADMIN' as any,
      });

      expect(result.id).toBe('uuid-123');
    });
  });

  describe('login', () => {
    it('should return token on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'password123',
        role: 'BUYER',
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'password123',
        role: 'BUYER',
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'none@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return the correct role', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '2',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'ADMIN',
      });

      const result = await service.login({
        email: 'admin@test.com',
        password: 'admin123',
      });

      expect(result.role).toBe('ADMIN');
    });
  });
});
