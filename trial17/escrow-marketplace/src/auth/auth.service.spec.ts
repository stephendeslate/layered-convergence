import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
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
  let jwt: { sign: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    jwt = {
      sign: vi.fn().mockReturnValue('mock-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'BUYER',
        passwordHash: 'hashed-password',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'BUYER' as never,
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-token');
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'BUYER',
      });
    });

    it('should throw ConflictException for existing email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'BUYER' as never,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash the password with bcrypt', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-pw' as never);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'BUYER',
        passwordHash: 'hashed-pw',
      });

      await service.register({
        email: 'test@example.com',
        password: 'mypassword',
        name: 'Test',
        role: 'BUYER' as never,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 12);
    });

    it('should return user without passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        name: 'A',
        role: 'SELLER',
        passwordHash: 'hashed',
      });

      const result = await service.register({
        email: 'a@b.com',
        password: 'pass1234',
        name: 'A',
        role: 'SELLER' as never,
      });

      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should register a SELLER role', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue({
        id: 'user-2',
        email: 'seller@test.com',
        name: 'Seller',
        role: 'SELLER',
        passwordHash: 'hashed',
      });

      const result = await service.register({
        email: 'seller@test.com',
        password: 'password123',
        name: 'Seller',
        role: 'SELLER' as never,
      });

      expect(result.user.role).toBe('SELLER');
    });

    it('should include user id in result', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue({
        id: 'uuid-123',
        email: 'test@test.com',
        name: 'Test',
        role: 'BUYER',
        passwordHash: 'hashed',
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
        role: 'BUYER' as never,
      });

      expect(result.user.id).toBe('uuid-123');
    });
  });

  describe('login', () => {
    it('should return user and token on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'BUYER',
        passwordHash: 'hashed-password',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-token');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should call bcrypt.compare with correct arguments', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'BUYER',
        passwordHash: 'stored-hash',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await service.login({ email: 'test@example.com', password: 'mypass' });

      expect(bcrypt.compare).toHaveBeenCalledWith('mypass', 'stored-hash');
    });

    it('should sign JWT with correct payload', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'SELLER',
        passwordHash: 'hashed',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await service.login({ email: 'test@example.com', password: 'pass' });

      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'SELLER',
      });
    });

    it('should not expose password in response', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'BUYER',
        passwordHash: 'hashed',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({
        email: 'test@example.com',
        password: 'pass',
      });

      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('validateUser', () => {
    it('should return user for valid id', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'BUYER',
      });

      const result = await service.validateUser('user-1');
      expect(result.id).toBe('user-1');
    });

    it('should throw UnauthorizedException for invalid id', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser('bad-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user with role', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'admin@test.com',
        name: 'Admin',
        role: 'ADMIN',
      });

      const result = await service.validateUser('user-1');
      expect(result.role).toBe('ADMIN');
    });

    it('should return user with name', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Full Name',
        role: 'BUYER',
      });

      const result = await service.validateUser('user-1');
      expect(result.name).toBe('Full Name');
    });
  });
});
