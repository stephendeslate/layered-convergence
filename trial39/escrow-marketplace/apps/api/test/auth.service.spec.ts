// TRACED: EM-TEST-001 — Auth service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@escrow-marketplace/shared';

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
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
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
      role: 'BUYER',
      tenantId: 'tenant-uuid-001',
    };

    it('should register a new user and return a JWT token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      prisma.user.create.mockResolvedValue({
        id: 'user-uuid-001',
        email: registerDto.email,
        role: 'BUYER',
        tenantId: registerDto.tenantId,
      });

      const result = await service.register(registerDto);

      expect(result).toEqual({ access_token: 'signed-jwt-token' });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, BCRYPT_SALT_ROUNDS);
    });

    it('should throw ConflictException if email already registered', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'securepass123',
      tenantId: 'tenant-uuid-001',
    };

    it('should return a JWT token on valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-uuid-001',
        email: loginDto.email,
        password: 'hashed_password',
        role: 'BUYER',
        tenantId: loginDto.tenantId,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: 'signed-jwt-token' });
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-uuid-001',
        email: loginDto.email,
        password: 'hashed_password',
        role: 'BUYER',
        tenantId: loginDto.tenantId,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user data when user exists', async () => {
      const userData = { id: 'user-uuid-001', email: 'test@example.com', role: 'BUYER', tenantId: 't1' };
      prisma.user.findFirst.mockResolvedValue(userData);

      const result = await service.validateUser('user-uuid-001');
      expect(result).toEqual(userData);
    });

    it('should return null when user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent');
      expect(result).toBeNull();
    });
  });
});
