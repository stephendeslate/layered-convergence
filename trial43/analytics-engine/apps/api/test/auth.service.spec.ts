import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

// TRACED:AE-TEST-001
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
      sign: jest.fn().mockReturnValue('test-jwt-token'),
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

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash,
        role: 'USER',
        tenantId: 'tenant-1',
        tenant: { id: 'tenant-1', name: 'Test' },
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('test-jwt-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const passwordHash = await bcrypt.hash('correct', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user and return token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-2',
        email: 'new@test.com',
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
        tenantId: 'tenant-1',
        role: 'USER',
      });

      expect(result.accessToken).toBe('test-jwt-token');
      expect(result.user.email).toBe('new@test.com');
    });

    it('should throw ConflictException for existing email', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'existing@test.com',
          password: 'password123',
          tenantId: 'tenant-1',
          role: 'USER',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
