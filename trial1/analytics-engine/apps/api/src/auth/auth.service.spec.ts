import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { buildTenant } from '../../test/factories';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockJwt: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {
      tenant: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      apiKey: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    mockJwt = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      verify: vi.fn(),
    };

    // Construct AuthService directly, injecting mocks
    authService = new AuthService(
      mockPrisma as unknown as PrismaService,
      mockJwt as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('should register a new tenant and return tokens', async () => {
      const tenant = buildTenant({ email: 'new@test.com' });
      mockPrisma.tenant.findUnique.mockResolvedValue(null);
      mockPrisma.tenant.create.mockResolvedValue(tenant);

      const result = await authService.register(
        'Test',
        'new@test.com',
        'password123',
      );

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(mockPrisma.tenant.create).toHaveBeenCalledOnce();
    });

    it('should throw ConflictException if email already exists', async () => {
      const existing = buildTenant();
      mockPrisma.tenant.findUnique.mockResolvedValue(existing);

      await expect(
        authService.register('Test', existing.email, 'password123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 4);
      const tenant = buildTenant({ passwordHash });
      mockPrisma.tenant.findUnique.mockResolvedValue(tenant);

      const result = await authService.login(tenant.email, 'password123');

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException for non-existent email', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@test.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 4);
      const tenant = buildTenant({ passwordHash });
      mockPrisma.tenant.findUnique.mockResolvedValue(tenant);

      await expect(
        authService.login(tenant.email, 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for deleted tenant', async () => {
      const tenant = {
        ...buildTenant(),
        deletedAt: new Date(),
      };
      mockPrisma.tenant.findUnique.mockResolvedValue(tenant);

      await expect(
        authService.login(tenant.email, 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateTenant', () => {
    it('should return tenant for valid ID', async () => {
      const tenant = buildTenant();
      mockPrisma.tenant.findUnique.mockResolvedValue(tenant);

      const result = await authService.validateTenant(tenant.id);
      expect(result).toEqual(tenant);
    });

    it('should throw UnauthorizedException for invalid ID', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        authService.validateTenant('nonexistent'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens for valid refresh token', async () => {
      const tenant = buildTenant();
      mockJwt.verify.mockReturnValue({
        sub: tenant.id,
        email: tenant.email,
        tier: tenant.tier,
      });
      mockPrisma.tenant.findUnique.mockResolvedValue(tenant);

      const result = await authService.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(
        authService.refreshToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
