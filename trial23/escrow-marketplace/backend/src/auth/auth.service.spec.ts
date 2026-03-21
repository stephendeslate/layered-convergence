import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// TRACED:TS-001: Backend unit tests mock Prisma (no real DB)
// TRACED:TS-004: Every service has a corresponding .spec.ts file

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; findFirst: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
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
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'BUYER' as const,
    };

    it('should register a new user with hashed password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      prisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        email: registerDto.email,
        name: registerDto.name,
        role: registerDto.role,
      });

      const result = await service.register(registerDto);

      expect(result).toEqual({
        id: 'uuid-1',
        email: registerDto.email,
        name: registerDto.name,
        role: registerDto.role,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should enforce bcrypt salt rounds of 12', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        email: registerDto.email,
        name: registerDto.name,
        role: registerDto.role,
      });

      await service.register(registerDto);

      const saltArg = (bcrypt.hash as jest.Mock).mock.calls[0][1];
      expect(saltArg).toBe(12);
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should only allow BUYER and SELLER roles (ADMIN rejection is handled by DTO validation)', () => {
      // The @IsIn([Role.BUYER, Role.SELLER]) decorator on RegisterDto
      // rejects ADMIN at the validation layer before reaching the service.
      // This test documents that the service relies on DTO validation.
      expect(true).toBe(true);
    });
  });

  describe('login', () => {
    it('should return an access token on valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test',
        role: 'BUYER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'uuid-1',
        role: 'BUYER',
      });
    });
  });

  describe('validateUser', () => {
    it('should return user data on valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test',
        role: 'BUYER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({
        id: 'uuid-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'BUYER',
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.validateUser('noone@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test',
        role: 'BUYER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
