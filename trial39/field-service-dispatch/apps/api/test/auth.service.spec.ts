// TRACED: FD-TEST-001 — Auth service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@field-service-dispatch/shared';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock; findUnique: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    jwt = { sign: jest.fn().mockReturnValue('mock-jwt-token') };

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
    const dto = {
      email: 'dispatcher@test.com',
      password: 'secure-password-123',
      role: 'DISPATCHER',
      tenantId: 'tenant-abc',
    };

    it('should register a new user and return an access token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        role: dto.role,
        tenantId: dto.tenantId,
      });

      const result = await service.register(dto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException for duplicate email within tenant', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should reject ADMIN role registration', async () => {
      await expect(
        service.register({ ...dto, role: 'ADMIN' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should use BCRYPT_SALT_ROUNDS constant of 12', () => {
      expect(BCRYPT_SALT_ROUNDS).toBe(12);
    });

    it('should strip HTML tags from email via sanitizeInput', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-2',
        email: 'clean@test.com',
        role: dto.role,
        tenantId: dto.tenantId,
      });

      await service.register({ ...dto, email: '<b>clean@test.com</b>' });
      const createArg = prisma.user.create.mock.calls[0][0];
      expect(createArg.data.email).toBe('clean@test.com');
    });

    it('should mask email in the registration response', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-3',
        email: 'dispatcher@test.com',
        role: dto.role,
        tenantId: dto.tenantId,
      });

      const result = await service.register(dto);
      expect(result.user.email).not.toBe('dispatcher@test.com');
    });
  });

  describe('login', () => {
    const dto = {
      email: 'dispatcher@test.com',
      password: 'secure-password-123',
      tenantId: 'tenant-abc',
    };

    it('should return a token for valid credentials', async () => {
      const hash = await bcrypt.hash('secure-password-123', 10);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        passwordHash: hash,
        tenantId: dto.tenantId,
        role: 'DISPATCHER',
      });

      const result = await service.login(dto);
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException for unknown user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('different-password', 10);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        passwordHash: hash,
        tenantId: dto.tenantId,
        role: 'DISPATCHER',
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'a@b.com' });
      const result = await service.findById('user-1');
      expect(result.id).toBe('user-1');
    });
  });
});
