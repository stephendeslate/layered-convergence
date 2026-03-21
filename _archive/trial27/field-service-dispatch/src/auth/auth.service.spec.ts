import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: 'DISPATCHER',
        companyId: 'comp-1',
        password: 'hashed',
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'pass123',
        name: 'Test',
        companyId: 'comp-1',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@test.com');
      expect(result.user.id).toBe('u1');
    });

    it('should throw ConflictException for existing email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' });

      await expect(
        service.register({
          email: 'existing@test.com',
          password: 'pass',
          name: 'Dup',
          companyId: 'comp-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash the password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        role: 'DISPATCHER',
        companyId: 'comp-1',
      });

      await service.register({
        email: 'test@test.com',
        password: 'myPassword',
        name: 'Test',
        companyId: 'comp-1',
      });

      const expectedHash = createHash('sha256')
        .update('myPassword')
        .digest('hex');
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password: expectedHash }),
        }),
      );
    });
  });

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const hashedPass = createHash('sha256').update('pass123').digest('hex');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@test.com',
        name: 'User',
        role: 'ADMIN',
        companyId: 'comp-1',
        password: hashedPass,
      });

      const result = await service.login({
        email: 'user@test.com',
        password: 'pass123',
      });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('user@test.com');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashedPass = createHash('sha256').update('correct').digest('hex');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@test.com',
        password: hashedPass,
      });

      await expect(
        service.login({ email: 'user@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user data', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'user@test.com',
        name: 'User',
        role: 'ADMIN',
        companyId: 'comp-1',
      });

      const result = await service.validateUser('u1');
      expect(result.email).toBe('user@test.com');
    });

    it('should throw UnauthorizedException for unknown user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.validateUser('bad')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
