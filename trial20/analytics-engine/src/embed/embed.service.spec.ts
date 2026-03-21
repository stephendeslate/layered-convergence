import { Test, TestingModule } from '@nestjs/testing';
import { EmbedService } from './embed.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { NotFoundException } from '@nestjs/common';

describe('EmbedService', () => {
  let service: EmbedService;
  let prisma: {
    embed: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; delete: jest.Mock };
  };
  let tenantCtx: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      embed: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    tenantCtx = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbedService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantCtx },
      ],
    }).compile();

    service = module.get<EmbedService>(EmbedService);
  });

  it('should find all embeds for a tenant', async () => {
    prisma.embed.findMany.mockResolvedValue([{ id: '1', token: 'abc' }]);
    const result = await service.findAll('tenant-1');
    expect(result).toHaveLength(1);
  });

  it('should find an embed by token', async () => {
    const futureDate = new Date(Date.now() + 86400000);
    prisma.embed.findUnique.mockResolvedValue({
      id: '1',
      token: 'abc',
      expiresAt: futureDate,
    });
    const result = await service.findByToken('abc');
    expect(result.token).toBe('abc');
  });

  it('should throw NotFoundException for expired embed', async () => {
    const pastDate = new Date(Date.now() - 86400000);
    prisma.embed.findUnique.mockResolvedValue({
      id: '1',
      token: 'abc',
      expiresAt: pastDate,
    });
    await expect(service.findByToken('abc')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException for missing embed', async () => {
    prisma.embed.findUnique.mockResolvedValue(null);
    await expect(service.findByToken('missing')).rejects.toThrow(NotFoundException);
  });

  it('should create an embed', async () => {
    prisma.embed.create.mockResolvedValue({
      id: '1',
      token: 'new-token',
      tenantId: 'tenant-1',
    });
    const result = await service.create(
      { dashboardId: 'dash-1', expiresAt: '2027-01-01T00:00:00Z' },
      'tenant-1',
    );
    expect(result.token).toBe('new-token');
  });
});
