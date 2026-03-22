// TRACED:AE-AUTH-UNIT-TEST
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

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
    it('should register a new user and return an access token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-1',
          email: 'test@example.com',
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Duplicate',
          role: 'USER',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'missing@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
