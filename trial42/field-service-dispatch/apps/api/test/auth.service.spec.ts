// TRACED: FD-AUTH-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@field-service-dispatch/shared';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      role: 'USER',
      tenantId: 'tenant-1',
    };

    it('should register a new user successfully', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        role: registerDto.role,
        tenantId: registerDto.tenantId,
        createdAt: new Date(),
      });

      const result = await authService.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.token).toBe('mock-token');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should hash password with BCRYPT_SALT_ROUNDS from shared', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: registerDto.email,
        role: registerDto.role,
        tenantId: registerDto.tenantId,
        createdAt: new Date(),
      });

      const hashSpy = jest.spyOn(bcrypt, 'hash') as jest.SpyInstance;
      await authService.register(registerDto);

      expect(hashSpy).toHaveBeenCalledWith(
        registerDto.password,
        BCRYPT_SALT_ROUNDS,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(
        loginDto.password,
        BCRYPT_SALT_ROUNDS,
      );
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: loginDto.email,
        passwordHash: hashedPassword,
        role: 'USER',
        tenantId: 'tenant-1',
      });

      const result = await authService.login(loginDto);

      expect(result.user.email).toBe(loginDto.email);
      expect(result.token).toBe('mock-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: loginDto.email,
        passwordHash: await bcrypt.hash('different', BCRYPT_SALT_ROUNDS),
        role: 'USER',
        tenantId: 'tenant-1',
      });

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
