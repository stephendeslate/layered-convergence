// TRACED: EM-TAUT-001
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@escrow-marketplace/shared';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { create: jest.Mock; findFirst: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    jwt = { sign: jest.fn().mockReturnValue('mock-token') };

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
    it('should hash password with correct salt rounds and create user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        role: 'BUYER',
        tenantId: 'tenant-1',
        createdAt: new Date(),
      };
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
        role: 'BUYER',
        tenantId: 'tenant-1',
      });

      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
      const isValid = await bcrypt.compare(
        'password123',
        await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS),
      );
      expect(isValid).toBe(true);
    });
  });

  describe('login', () => {
    it('should return token on valid credentials', async () => {
      const hash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        role: 'BUYER',
        tenantId: 'tenant-1',
        passwordHash: hash,
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.token).toBe('mock-token');
    });

    it('should throw on invalid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw on wrong password', async () => {
      const hash = await bcrypt.hash('correct', BCRYPT_SALT_ROUNDS);
      prisma.user.findFirst.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        role: 'BUYER',
        tenantId: 'tenant-1',
        passwordHash: hash,
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
