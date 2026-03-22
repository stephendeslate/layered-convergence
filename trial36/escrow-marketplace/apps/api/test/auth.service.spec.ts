import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@escrow-marketplace/shared';

// TRACED: EM-TEST-001 — Unit tests for auth service

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
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
      password: 'securepass123',
      name: 'Test User',
      role: 'BUYER' as const,
      tenantId: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('should register a new user with bcrypt hashing', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: registerDto.email,
        name: registerDto.name,
        role: registerDto.role,
      });

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, BCRYPT_SALT_ROUNDS);
      expect(result).toEqual({
        id: 'user-id',
        email: registerDto.email,
        name: registerDto.name,
        role: registerDto.role,
      });
    });

    it('should throw ConflictException if email exists in tenant', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should reject ADMIN role registration', async () => {
      const adminDto = { ...registerDto, role: 'ADMIN' as const };

      await expect(service.register(adminDto)).rejects.toThrow(BadRequestException);
    });

    it('should sanitize the user name', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({
        id: 'id',
        email: 'test@example.com',
        name: 'Clean Name',
        role: 'BUYER',
      });

      await service.register({
        ...registerDto,
        name: '<script>alert("xss")</script>Clean Name',
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'alert("xss")Clean Name',
          }),
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'securepass123',
      tenantId: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('should return access_token on valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        password: 'hashed',
        role: 'BUYER',
        tenantId: loginDto.tenantId,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id',
        email: loginDto.email,
        role: 'BUYER',
        tenantId: loginDto.tenantId,
      });
    });

    it('should throw UnauthorizedException on invalid email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-id',
        email: loginDto.email,
        password: 'hashed',
        role: 'BUYER',
        tenantId: loginDto.tenantId,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const profile = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test',
        role: 'BUYER',
        balance: '100.00',
        tenantId: 'tenant-id',
        createdAt: new Date(),
      };
      prisma.user.findFirst.mockResolvedValue(profile);

      const result = await service.getProfile('user-id');

      expect(result).toEqual(profile);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
