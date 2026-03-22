// TRACED: AE-TEST-01
// TRACED: AE-TEST-02
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock }; tenant: { create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      tenant: {
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
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
      password: 'securepassword123',
      name: 'Test User',
      role: 'EDITOR',
    };

    it('should hash the password with bcrypt before storing', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.tenant.create.mockResolvedValue({ id: 'tenant-1' });
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        name: registerDto.name,
        role: registerDto.role,
        tenantId: 'tenant-1',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should return a JWT token on successful registration', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.tenant.create.mockResolvedValue({ id: 'tenant-1' });
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        name: registerDto.name,
        role: registerDto.role,
        tenantId: 'tenant-1',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register(registerDto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-1',
          email: registerDto.email,
          role: registerDto.role,
          tenantId: 'tenant-1',
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'securepassword123',
    };

    it('should return a JWT token on successful login', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: loginDto.email,
        passwordHash: 'hashed-password',
        name: 'Test User',
        role: 'EDITOR',
        tenantId: 'tenant-1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: loginDto.email,
        passwordHash: 'hashed-password',
        name: 'Test User',
        role: 'EDITOR',
        tenantId: 'tenant-1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
