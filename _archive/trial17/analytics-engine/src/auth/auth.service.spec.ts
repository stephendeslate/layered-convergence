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

  it('should validate a valid API key and return tenantId', async () => {
    prisma.tenant.findFirst.mockResolvedValue({
      id: 'tenant-1',
      apiKey: 'valid-key',
    });

    const result = await service.validateApiKey('valid-key');
    expect(result).toEqual({ tenantId: 'tenant-1' });
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

  it('should query prisma with the provided API key', async () => {
    prisma.tenant.findFirst.mockResolvedValue({
      id: 'tenant-2',
      apiKey: 'key-123',
    });

    await service.validateApiKey('key-123');
    expect(prisma.tenant.findFirst).toHaveBeenCalledWith({
      where: { apiKey: 'key-123' },
    });
  });
});
