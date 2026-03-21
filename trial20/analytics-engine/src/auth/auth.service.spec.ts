import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock }; tenant: { findUnique: jest.Mock; create: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn() },
      tenant: { findUnique: jest.fn(), create: jest.fn() },
    };
    jwt = { sign: jest.fn().mockReturnValue('test-token') };

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
    it('should reject ADMIN role registration', async () => {
      await expect(
        service.register({
          email: 'admin@test.com',
          name: 'Admin',
          password: 'password123',
          tenantSlug: 'test',
          role: Role.ADMIN,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        service.register({
          email: 'test@test.com',
          name: 'Test',
          password: 'password123',
          tenantSlug: 'test',
          role: Role.VIEWER,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user with hashed password and return token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1', slug: 'test' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        tenantId: 'tenant-1',
        role: Role.VIEWER,
      });

      const result = await service.register({
        email: 'test@test.com',
        name: 'Test',
        password: 'password123',
        tenantSlug: 'test',
        role: Role.VIEWER,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(result).toEqual({
        token: 'test-token',
        user: {
          id: 'user-1',
          email: 'test@test.com',
          name: 'Test',
          tenantId: 'tenant-1',
          role: Role.VIEWER,
        },
      });
    });

    it('should create tenant if not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.tenant.findUnique.mockResolvedValue(null);
      prisma.tenant.create.mockResolvedValue({ id: 'new-tenant', slug: 'new' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        tenantId: 'new-tenant',
        role: Role.EDITOR,
      });

      await service.register({
        email: 'test@test.com',
        name: 'Test',
        password: 'password123',
        tenantSlug: 'new',
        role: Role.EDITOR,
      });

      expect(prisma.tenant.create).toHaveBeenCalledWith({
        data: { name: 'new', slug: 'new' },
      });
    });
  });

  describe('login', () => {
    it('should throw on invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw on invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        password: 'hashed',
        tenantId: 'tenant-1',
        role: Role.ANALYST,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result.token).toBe('test-token');
      expect(result.user.id).toBe('user-1');
      expect(result.user.role).toBe(Role.ANALYST);
    });
  });
});
