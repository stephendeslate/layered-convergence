import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

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
    it('should register a new buyer', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        email: 'buyer@test.com',
        role: Role.BUYER,
        password: 'hashed',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.register({
        email: 'buyer@test.com',
        password: 'password123',
        role: Role.BUYER,
      });

      expect(result).toEqual({
        token: 'test-token',
        user: { id: '1', email: 'buyer@test.com', role: Role.BUYER },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should reject ADMIN registration', async () => {
      await expect(
        service.register({
          email: 'admin@test.com',
          password: 'password123',
          role: Role.ADMIN,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException for duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(
        service.register({
          email: 'buyer@test.com',
          password: 'password123',
          role: Role.BUYER,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'buyer@test.com',
        password: 'hashed',
        role: Role.BUYER,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'buyer@test.com',
        password: 'password123',
      });

      expect(result).toEqual({
        token: 'test-token',
        user: { id: '1', email: 'buyer@test.com', role: Role.BUYER },
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'wrong@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'buyer@test.com',
        password: 'hashed',
        role: Role.BUYER,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'buyer@test.com',
          password: 'wrong',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user by id', async () => {
      const user = { id: '1', email: 'test@test.com', role: Role.BUYER };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser('1');
      expect(result).toEqual(user);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
