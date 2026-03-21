import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
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
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        password: 'hashed',
        role: 'DISPATCHER',
        companyId: 'comp1',
      });
      const result = await service.register({
        email: 'test@test.com',
        name: 'Test',
        password: 'password123',
        companyId: 'comp1',
      });
      expect(result.user.email).toBe('test@test.com');
      expect(result.token).toBeDefined();
      expect(result.token.split('.')).toHaveLength(3);
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(
        service.register({
          email: 'test@test.com',
          name: 'Test',
          password: 'password123',
          companyId: 'comp1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const { createHash } = await import('crypto');
      const hashedPassword = createHash('sha256').update('password123').digest('hex');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        password: hashedPassword,
        role: 'DISPATCHER',
        companyId: 'comp1',
      });
      const result = await service.login({ email: 'test@test.com', password: 'password123' });
      expect(result.user.email).toBe('test@test.com');
      expect(result.token).toBeDefined();
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'unknown@test.com', password: 'x' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        password: 'wronghash',
        role: 'DISPATCHER',
        companyId: 'comp1',
      });
      await expect(
        service.login({ email: 'test@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user data', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: 'DISPATCHER',
        companyId: 'comp1',
      });
      const result = await service.validateUser('u1');
      expect(result.id).toBe('u1');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.validateUser('u999')).rejects.toThrow(UnauthorizedException);
    });
  });
});
