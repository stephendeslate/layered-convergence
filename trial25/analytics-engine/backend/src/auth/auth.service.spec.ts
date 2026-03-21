import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// [TRACED:TS-001] Unit test for AuthService with mocked dependencies
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
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

      const result = await service.register(
        { email: 'test@example.com', password: 'password123', name: 'Test', role: 'VIEWER' },
        'tenant-1',
      );

      expect(result).toEqual({ accessToken: 'test-token' });
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'test@example.com' }),
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register(
          { email: 'test@example.com', password: 'password123', name: 'Test', role: 'VIEWER' },
          'tenant-1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(result).toEqual({ accessToken: 'test-token' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
