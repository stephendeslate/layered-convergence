// [TRACED:TS-001] All 8 services have .spec.ts unit test files in src/
// [TRACED:TS-002] Unit tests use Test.createTestingModule with mocked dependencies

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { create: jest.Mock; findFirst: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should hash password with salt 12 and create user', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'DISPATCHER' as const,
        companyId: 'company-uuid',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue({
        id: 'user-uuid',
        email: dto.email,
        role: dto.role,
        passwordHash: 'hashed-password',
        companyId: dto.companyId,
      });

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          passwordHash: 'hashed-password',
          role: dto.role,
          companyId: dto.companyId,
        },
      });
      expect(result).toEqual({
        id: 'user-uuid',
        email: dto.email,
        role: dto.role,
      });
    });

    it('should reject ADMIN role', async () => {
      const dto = {
        email: 'admin@example.com',
        password: 'password123',
        role: 'ADMIN' as 'DISPATCHER',
        companyId: 'company-uuid',
      };

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('should allow TECHNICIAN role', async () => {
      const dto = {
        email: 'tech@example.com',
        password: 'password123',
        role: 'TECHNICIAN' as const,
        companyId: 'company-uuid',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue({
        id: 'user-uuid',
        email: dto.email,
        role: dto.role,
        passwordHash: 'hashed-password',
        companyId: dto.companyId,
      });

      const result = await service.register(dto);
      expect(result.role).toBe('TECHNICIAN');
    });
  });

  describe('login', () => {
    it('should return access_token on valid credentials', async () => {
      const user = {
        id: 'user-uuid',
        email: 'test@example.com',
        role: 'DISPATCHER',
        companyId: 'company-uuid',
        passwordHash: 'hashed-password',
      };

      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user on valid email and password', async () => {
      const user = {
        id: 'user-uuid',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: 'DISPATCHER',
        companyId: 'company-uuid',
      };

      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await service.validateUser('none@example.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null on wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-uuid',
        email: 'test@example.com',
        passwordHash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });
});
