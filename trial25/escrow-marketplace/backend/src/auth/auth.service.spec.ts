import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// [TRACED:TS-001] Unit test for AuthService with mocked dependencies
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
    jwtService = { sign: jest.fn().mockReturnValue('test-token') };

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
        email: 'buyer@example.com',
        name: 'Buyer',
        role: 'BUYER',
      });

      const result = await service.register({
        email: 'buyer@example.com',
        password: 'password123',
        name: 'Buyer',
        role: 'BUYER',
      });

      expect(result).toEqual({ accessToken: 'test-token' });
    });

    it('should throw ConflictException if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'buyer@example.com',
          password: 'password123',
          name: 'Buyer',
          role: 'BUYER',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'buyer@example.com',
        password: hashedPassword,
        role: 'BUYER',
      });

      const result = await service.login({ email: 'buyer@example.com', password: 'password123' });
      expect(result).toEqual({ accessToken: 'test-token' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'buyer@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
