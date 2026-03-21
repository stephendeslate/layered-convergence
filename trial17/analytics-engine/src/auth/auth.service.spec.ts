import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

vi.mock('bcrypt', () => ({
  default: { hash: vi.fn(), compare: vi.fn() },
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    tenant: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };
  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
    verifyAsync: ReturnType<typeof vi.fn>;
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed-password',
    tenantId: 'tenant-1',
    role: 'member',
  };

  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    slug: 'test-tenant',
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      tenant: {
        findUnique: vi.fn(),
      },
    };
    jwtService = {
      signAsync: vi.fn().mockResolvedValue('test-jwt-token'),
      verifyAsync: vi.fn(),
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
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      tenantId: 'tenant-1',
    };

    it('should register a new user and return token', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.user.findFirst.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result.accessToken).toBe('test-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.tenantId).toBe('tenant-1');
    });

    it('should hash password with salt rounds of 12', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.user.findFirst.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue(mockUser);

      await service.register(registerDto);

      expect(vi.mocked(bcrypt.hash)).toHaveBeenCalledWith('password123', 12);
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should include user role in JWT payload', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.user.findFirst.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue(mockUser);

      await service.register(registerDto);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-1',
          email: 'test@example.com',
          tenantId: 'tenant-1',
          role: 'member',
        }),
      );
    });

    it('should not return password in the response', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.user.findFirst.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty('password');
    });

    it('should create user with provided tenantId', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.user.findFirst.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue(mockUser);

      await service.register(registerDto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId: 'tenant-1' }),
      });
    });

    // FM #52: Registration validates tenant exists
    it('should throw BadRequestException if tenant does not exist', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate tenant before checking email uniqueness', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(
        'Invalid tenant ID',
      );

      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should login and return access token', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('test-jwt-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should throw UnauthorizedException for non-existent email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user info without password', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login(loginDto);

      expect(result.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        tenantId: 'tenant-1',
        role: 'member',
      });
    });

    it('should compare password with bcrypt', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await service.login(loginDto);

      expect(vi.mocked(bcrypt.compare)).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );
    });

    it('should sign JWT with correct payload', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await service.login(loginDto);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
        tenantId: 'tenant-1',
        role: 'member',
      });
    });
  });

  describe('validateToken', () => {
    it('should verify and return payload', async () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        tenantId: 'tenant-1',
        role: 'member',
      };
      jwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.validateToken('valid-token');
      expect(result).toEqual(payload);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.validateToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should use JwtService.verifyAsync not raw base64 decode (FM #44)', async () => {
      const payload = { sub: 'user-1', tenantId: 'tenant-1' };
      jwtService.verifyAsync.mockResolvedValue(payload);

      await service.validateToken('test-token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('test-token');
    });
  });
});
