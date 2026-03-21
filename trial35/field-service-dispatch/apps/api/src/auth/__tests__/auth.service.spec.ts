// TRACED: FD-TEST-001 — Auth service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@field-service-dispatch/shared';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock; findUnique: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = { user: { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn() } };
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
    const dto = { email: 'test@example.com', password: 'password123', role: 'DISPATCHER', tenantId: 'tenant-1' };

    it('should register a new user with hashed password', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'user-1', email: dto.email, role: dto.role });

      const result = await service.register(dto);

      expect(result.accessToken).toBe('test-token');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should reject duplicate emails', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should reject ADMIN role registration', async () => {
      await expect(service.register({ ...dto, role: 'ADMIN' })).rejects.toThrow(ConflictException);
    });

    it('should use bcrypt salt rounds of 12', () => {
      expect(BCRYPT_SALT_ROUNDS).toBe(12);
    });
  });

  describe('login', () => {
    const dto = { email: 'test@example.com', password: 'password123', tenantId: 'tenant-1' };

    it('should return token for valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      prisma.user.findFirst.mockResolvedValue({ id: 'user-1', email: dto.email, passwordHash: hash, tenantId: dto.tenantId, role: 'DISPATCHER' });

      const result = await service.login(dto);
      expect(result.accessToken).toBe('test-token');
    });

    it('should reject invalid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
