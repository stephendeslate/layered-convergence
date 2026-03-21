import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should reject ADMIN role', async () => {
      await expect(
        service.register({ email: 'test@test.com', password: 'password123', role: 'ADMIN', tenantId: 'tenant-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        service.register({ email: 'test@test.com', password: 'password123', role: 'VIEWER', tenantId: 'tenant-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create user with hashed password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockPrismaService.user.create.mockResolvedValue({ id: '1', email: 'test@test.com', role: 'VIEWER' });

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });

      expect(result).toEqual({ id: '1', email: 'test@test.com', role: 'VIEWER' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });
  });

  describe('login', () => {
    it('should throw on invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw on invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return JWT on valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
        role: 'VIEWER',
        tenantId: 'tenant-1',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.login({ email: 'test@test.com', password: 'password123' });

      expect(result).toEqual({ accessToken: 'jwt_token' });
    });
  });
});
