import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findFirst: jest.fn(),
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
    it('should hash password with salt 12 and create user', async () => {
      const dto = { email: 'test@example.com', password: 'password123', role: 'VIEWER' as const, tenantId: 'tenant-1' };
      const hashedPassword = '$2b$12$hashedvalue';
      const createdUser = { id: 'user-1', email: dto.email, password: hashedPassword, role: dto.role, tenantId: dto.tenantId };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: dto.role,
          tenantId: dto.tenantId,
        },
      });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should reject ADMIN role registration', async () => {
      const dto = { email: 'admin@example.com', password: 'password123', role: 'ADMIN' as unknown as 'VIEWER', tenantId: 'tenant-1' };

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('should use salt rounds of 12', async () => {
      const dto = { email: 'test@example.com', password: 'mypassword', role: 'ANALYST' as const, tenantId: 'tenant-1' };
      const createdUser = { id: 'user-2', email: dto.email, password: 'hashed', role: dto.role, tenantId: dto.tenantId };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue('token');

      await service.register(dto);

      const saltArg = (bcrypt.hash as jest.Mock).mock.calls[0][1];
      expect(saltArg).toBe(12);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const user = { id: 'user-1', email: dto.email, password: 'hashed', role: 'VIEWER', tenantId: 'tenant-1' };

      mockPrismaService.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(dto);

      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const dto = { email: 'missing@example.com', password: 'password123' };

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const dto = { email: 'test@example.com', password: 'wrongpass' };
      const user = { id: 'user-1', email: dto.email, password: 'hashed', role: 'VIEWER', tenantId: 'tenant-1' };

      mockPrismaService.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid userId', async () => {
      const user = { id: 'user-1', email: 'test@example.com', role: 'VIEWER', tenantId: 'tenant-1' };

      mockPrismaService.user.findFirst.mockResolvedValue(user);

      const result = await service.validateUser('user-1');

      expect(result).toEqual({ id: 'user-1', email: 'test@example.com', role: 'VIEWER', tenantId: 'tenant-1' });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.validateUser('invalid-id')).rejects.toThrow(UnauthorizedException);
    });
  });
});
