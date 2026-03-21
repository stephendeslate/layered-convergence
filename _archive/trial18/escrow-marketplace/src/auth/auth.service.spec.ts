import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };
    service = new AuthService(prisma as any);
  });

  describe('register', () => {
    const dto = {
      email: 'test@example.com',
      name: 'Test User',
      role: 'BUYER' as const,
      password: 'password123',
    };

    it('should register a new user and return token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        name: dto.name,
        role: dto.role,
        passwordHash: hashPassword(dto.password),
      });

      const result = await service.register(dto);

      expect(result.id).toBe('user-1');
      expect(result.email).toBe(dto.email);
      expect(result.name).toBe(dto.name);
      expect(result.role).toBe(dto.role);
      expect(result.token).toBeDefined();

      const decoded = JSON.parse(Buffer.from(result.token, 'base64').toString('utf-8'));
      expect(decoded.userId).toBe('user-1');
    });

    it('should throw BadRequestException if email already registered', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      await expect(service.register(dto)).rejects.toThrow('Email already registered');
    });

    it('should hash the password before storing', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        name: dto.name,
        role: dto.role,
      });

      await service.register(dto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          passwordHash: hashPassword(dto.password),
        }),
      });
    });

    it('should include email and name in user creation data', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        name: dto.name,
        role: dto.role,
      });

      await service.register(dto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: dto.email,
          name: dto.name,
          role: dto.role,
        }),
      });
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'password123' };

    it('should login with valid credentials and return token', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        name: 'Test User',
        role: 'BUYER',
        passwordHash: hashPassword(dto.password),
      });

      const result = await service.login(dto);

      expect(result.id).toBe('user-1');
      expect(result.email).toBe(dto.email);
      expect(result.token).toBeDefined();

      const decoded = JSON.parse(Buffer.from(result.token, 'base64').toString('utf-8'));
      expect(decoded.userId).toBe('user-1');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        passwordHash: hashPassword('different-password'),
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('Invalid credentials');
    });

    it('should return user role in login response', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        name: 'Provider User',
        role: 'PROVIDER',
        passwordHash: hashPassword(dto.password),
      });

      const result = await service.login(dto);

      expect(result.role).toBe('PROVIDER');
      expect(result.name).toBe('Provider User');
    });
  });
});
