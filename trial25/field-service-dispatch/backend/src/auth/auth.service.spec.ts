// [TRACED:TS-001] Unit test for AuthService — registration and login
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
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
    it('should register a new user and return access token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'DISPATCHER',
        companyId: 'company-1',
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'DISPATCHER',
        companyId: 'company-1',
      });

      expect(result).toEqual({ accessToken: 'test-token' });
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'DISPATCHER',
          companyId: 'company-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'DISPATCHER',
        companyId: 'company-1',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'test-token' });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'bad@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'DISPATCHER',
        companyId: 'company-1',
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
