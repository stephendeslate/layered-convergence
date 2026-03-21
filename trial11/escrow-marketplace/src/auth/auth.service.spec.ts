import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRole } from '../../generated/prisma/client.js';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { create: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn>; findUnique: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = {
      user: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create a user and return token', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.BUYER,
        passwordHash: Buffer.from('password123').toString('base64'),
      };
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        role: UserRole.BUYER,
      });

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.BUYER,
          passwordHash: Buffer.from('password123').toString('base64'),
        },
      });
    });
  });

  describe('login', () => {
    it('should return user with token for valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.BUYER,
        passwordHash: Buffer.from('password123').toString('base64'),
      };
      prisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.login('test@example.com', 'password123');

      expect(result.id).toBe('user-1');
      expect(result.token).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login('bad@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.BUYER,
        passwordHash: Buffer.from('correct-password').toString('base64'),
      };
      prisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.login('test@example.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validatePassword', () => {
    it('should return true for matching password', () => {
      const hash = Buffer.from('my-password').toString('base64');
      expect(service.validatePassword('my-password', hash)).toBe(true);
    });

    it('should return false for non-matching password', () => {
      const hash = Buffer.from('my-password').toString('base64');
      expect(service.validatePassword('wrong-password', hash)).toBe(false);
    });
  });

  describe('generateToken / parseToken', () => {
    it('should generate a parseable token', () => {
      const token = service.generateToken('user-123');
      const parsed = service.parseToken(token);
      expect(parsed).not.toBeNull();
      expect(parsed!.userId).toBe('user-123');
    });

    it('should return null for invalid token', () => {
      expect(service.parseToken('invalid-token-data!!!')).toBeNull();
    });

    it('should return null for token without userId', () => {
      const token = Buffer.from(JSON.stringify({ foo: 'bar' })).toString('base64');
      expect(service.parseToken(token)).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should call prisma findUnique', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findUserById('user-1');
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });
  });
});
