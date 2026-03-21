import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma.service';

// TRACED: AE-TA-UNIT-001 — Auth service unit tests
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
    jwt = { sign: jest.fn().mockReturnValue('mock-token') };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('should reject ADMIN role registration', async () => {
      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
          tenantId: 'tenant-1',
          role: 'ADMIN',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject duplicate email', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1', email: 'test@example.com' });
      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
          tenantId: 'tenant-1',
          role: 'ANALYST',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password with salt 12 and return token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        role: 'ANALYST',
      });

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        tenantId: 'tenant-1',
        role: 'ANALYST',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(result).toEqual({ access_token: 'mock-token' });
    });
  });

  describe('login', () => {
    it('should reject invalid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(
        service.login({ email: 'no@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token for valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        id: '1',
        passwordHash: 'hashed',
        tenantId: 'tenant-1',
        role: 'OWNER',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ access_token: 'mock-token' });
    });
  });
});
