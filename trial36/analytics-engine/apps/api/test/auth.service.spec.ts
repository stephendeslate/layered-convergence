// TRACED: AE-TEST-001
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma.service';

jest.mock('bcrypt');

const mockPrisma = {
  tenant: {
    findFirst: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'ANALYST',
      tenantSlug: 'acme',
    };

    it('should register a new user successfully', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1', slug: 'acme' });
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ANALYST',
        tenantId: 'tenant-1',
      });

      const result = await service.register(registerDto);

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should throw NotFoundException when tenant does not exist', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1' });
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw UnauthorizedException for invalid role', async () => {
      await expect(
        service.register({ ...registerDto, role: 'ADMIN' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should sanitize name input by stripping HTML tags', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1' });
      mockPrisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ANALYST',
        tenantId: 'tenant-1',
      });

      await service.register({
        ...registerDto,
        name: '<script>alert("xss")</script>Test User',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'alert("xss")Test User',
          }),
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should login successfully with valid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ANALYST',
        tenantId: 'tenant-1',
        passwordHash: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        passwordHash: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test',
        role: 'ANALYST',
        tenantId: 'tenant-1',
      };
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
