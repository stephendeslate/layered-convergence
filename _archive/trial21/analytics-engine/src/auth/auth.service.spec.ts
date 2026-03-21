import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { tenant: { findFirst: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = {
      tenant: {
        findFirst: vi.fn(),
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

  it('should return tenantId for valid API key', async () => {
    prisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1', apiKey: 'key-1' });
    const result = await service.validateApiKey('key-1');
    expect(result).toEqual({ tenantId: 'tenant-1' });
  });

  it('should throw UnauthorizedException for empty API key', async () => {
    await expect(service.validateApiKey('')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid API key', async () => {
    prisma.tenant.findFirst.mockResolvedValue(null);
    await expect(service.validateApiKey('bad-key')).rejects.toThrow(UnauthorizedException);
  });

  it('should query tenant by apiKey', async () => {
    prisma.tenant.findFirst.mockResolvedValue({ id: 'tenant-1', apiKey: 'key-1' });
    await service.validateApiKey('key-1');
    expect(prisma.tenant.findFirst).toHaveBeenCalledWith({
      where: { apiKey: 'key-1' },
    });
  });

  it('should throw with message for null API key', async () => {
    await expect(service.validateApiKey(null as unknown as string)).rejects.toThrow(
      'API key is required',
    );
  });

  it('should throw with message for invalid key', async () => {
    prisma.tenant.findFirst.mockResolvedValue(null);
    await expect(service.validateApiKey('nonexistent')).rejects.toThrow(
      'Invalid API key',
    );
  });
});
