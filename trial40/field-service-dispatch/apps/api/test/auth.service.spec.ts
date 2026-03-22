// TRACED: FD-AUTH-005 — Auth service unit tests with bcrypt and JWT mocks
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should reject ADMIN role registration', async () => {
      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          role: 'ADMIN',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject duplicate email within same tenant', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'dup@test.com',
          password: 'password123',
          role: 'DISPATCHER',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return token on success', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'new@test.com',
        role: 'DISPATCHER',
        tenantId: 'tenant-1',
      });

      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
        role: 'DISPATCHER',
        tenantId: 'tenant-1',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should sanitize email input', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'cleantest.com',
        role: 'TECHNICIAN',
        tenantId: 'tenant-1',
      });

      await service.register({
        email: '<script>test.com',
        password: 'password123',
        role: 'TECHNICIAN',
        tenantId: 'tenant-1',
      });

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ email: expect.not.stringContaining('<script>') }),
        }),
      );
    });
  });

  describe('login', () => {
    it('should reject non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nobody@test.com',
          password: 'password123',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject invalid password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'user@test.com',
        passwordHash: '$2b$12$invalidhashvaluehere',
        role: 'DISPATCHER',
        tenantId: 'tenant-1',
      });

      await expect(
        service.login({
          email: 'user@test.com',
          password: 'wrongpassword',
          tenantId: 'tenant-1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 'user-1', email: 'test@test.com' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');
      expect(result).toEqual(mockUser);
    });
  });
});
