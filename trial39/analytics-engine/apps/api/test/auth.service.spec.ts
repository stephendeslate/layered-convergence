// TRACED:AE-TEST-01 — Auth service unit tests

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
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
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      displayName: 'Test User',
      role: 'EDITOR',
      tenantId: 'tenant-uuid-1',
    };

    it('should register a new user and return token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        displayName: registerDto.displayName,
        role: registerDto.role,
        tenantId: registerDto.tenantId,
        createdAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.token).toBe('mock-jwt-token');
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, BCRYPT_SALT_ROUNDS);
    });

    it('should throw ConflictException for duplicate email', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should return user and token on valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: loginDto.email,
        passwordHash: 'hashed-pw',
        displayName: 'Test User',
        role: 'EDITOR',
        tenantId: 'tenant-1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.user.email).toBe(loginDto.email);
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: loginDto.email,
        passwordHash: 'hashed-pw',
        displayName: 'Test User',
        role: 'EDITOR',
        tenantId: 'tenant-1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
