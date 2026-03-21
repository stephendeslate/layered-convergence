import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(AuthService);
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        role: 'DISPATCHER',
        companyId: 'comp-1',
        password: 'hashed',
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
        companyId: 'comp-1',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1' });
      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test',
          companyId: 'comp-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const { createHash } = await import('crypto');
      const hashedPassword = createHash('sha256').update('password123').digest('hex');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        role: 'DISPATCHER',
        companyId: 'comp-1',
        password: hashedPassword,
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@x.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'wronghash',
      });
      await expect(
        service.login({ email: 'test@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user data', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        role: 'DISPATCHER',
        companyId: 'comp-1',
      });
      const result = await service.validateUser('1');
      expect(result.id).toBe('1');
    });

    it('should throw UnauthorizedException if not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.validateUser('1')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
