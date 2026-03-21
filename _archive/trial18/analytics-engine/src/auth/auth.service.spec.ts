import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    tenant: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    apiKey: 'valid-api-key',
  };

  beforeEach(async () => {
    prisma = {
      tenant: {
        findFirst: vi.fn().mockResolvedValue(mockTenant),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate a valid API key', async () => {
    const result = await service.validateApiKey('valid-api-key');
    expect(result.tenantId).toBe('tenant-1');
  });

  it('should throw UnauthorizedException for empty API key', async () => {
    await expect(service.validateApiKey('')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException for invalid API key', async () => {
    prisma.tenant.findFirst.mockResolvedValue(null);
    await expect(service.validateApiKey('invalid-key')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should query tenant by API key', async () => {
    await service.validateApiKey('valid-api-key');
    expect(prisma.tenant.findFirst).toHaveBeenCalledWith({
      where: { apiKey: 'valid-api-key' },
    });
  });

  it('should return tenantId on success', async () => {
    const result = await service.validateApiKey('valid-api-key');
    expect(result).toEqual({ tenantId: 'tenant-1' });
  });
});
