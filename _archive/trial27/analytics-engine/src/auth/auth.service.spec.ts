import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: { tenant: { findFirst: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = {
      tenant: { findFirst: vi.fn() },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  describe('validateApiKey', () => {
    it('should return tenantId for valid API key', async () => {
      prisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1', apiKey: 'key-1' });
      const result = await authService.validateApiKey('key-1');
      expect(result).toEqual({ tenantId: 'tenant-1' });
    });

    it('should throw UnauthorizedException for empty API key', async () => {
      await expect(authService.validateApiKey('')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid API key', async () => {
      prisma.tenant.findFirst.mockResolvedValue(null);
      await expect(authService.validateApiKey('bad-key')).rejects.toThrow(UnauthorizedException);
    });

    it('should query tenant by apiKey', async () => {
      prisma.tenant.findFirst.mockResolvedValue({ id: 't-1', apiKey: 'key-x' });
      await authService.validateApiKey('key-x');
      expect(prisma.tenant.findFirst).toHaveBeenCalledWith({ where: { apiKey: 'key-x' } });
    });

    it('should throw with message "API key is required" for empty key', async () => {
      await expect(authService.validateApiKey('')).rejects.toThrow('API key is required');
    });

    it('should throw with message "Invalid API key" for unknown key', async () => {
      prisma.tenant.findFirst.mockResolvedValue(null);
      await expect(authService.validateApiKey('nope')).rejects.toThrow('Invalid API key');
    });
  });
});
