import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> } };
  let jwt: { sign: ReturnType<typeof vi.fn> };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-pw',
    role: 'MEMBER',
    organizationId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    jwt = {
      sign: vi.fn().mockReturnValue('jwt-token'),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('bad@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(false));

      await expect(
        service.validateUser('test@example.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return accessToken and user on successful login', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(true));

      const result = await service.login('test@example.com', 'password');

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should call jwtService.sign with correct payload', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(true));

      await service.login('test@example.com', 'password');

      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'MEMBER',
        organizationId: 'org-1',
      });
    });

    it('should throw when credentials are invalid', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('bad@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user and return accessToken', async () => {
      vi.mocked(bcrypt.hash).mockImplementation(() => Promise.resolve('hashed'));
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register('test@example.com', 'password', 'org-1');

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should hash password before storing', async () => {
      vi.mocked(bcrypt.hash).mockImplementation(() => Promise.resolve('hashed'));
      prisma.user.create.mockResolvedValue(mockUser);

      await service.register('test@example.com', 'password', 'org-1');

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });

    it('should pass organizationId to prisma', async () => {
      vi.mocked(bcrypt.hash).mockImplementation(() => Promise.resolve('hashed'));
      prisma.user.create.mockResolvedValue(mockUser);

      await service.register('test@example.com', 'password', 'org-1');

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed',
          organizationId: 'org-1',
        },
      });
    });
  });
});
