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
  let tenantContext: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      embed: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    tenantContext = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbedService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<EmbedService>(EmbedService);
  });

  it('should find all embeds for a tenant', async () => {
    const embeds = [{ id: '1', token: 'abc', tenantId: 't1' }];
    prisma.embed.findMany.mockResolvedValue(embeds);

    const result = await service.findAll('t1');
    expect(result).toEqual(embeds);
  });

  it('should find embed by token', async () => {
    const future = new Date(Date.now() + 86400000);
    prisma.embed.findUnique.mockResolvedValue({ id: '1', token: 'abc', expiresAt: future });

    const result = await service.findByToken('abc');
    expect(result.token).toBe('abc');
  });

  it('should throw NotFoundException for expired embed', async () => {
    const past = new Date(Date.now() - 86400000);
    prisma.embed.findUnique.mockResolvedValue({ id: '1', token: 'abc', expiresAt: past });

    await expect(service.findByToken('abc')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException for non-existent embed', async () => {
    prisma.embed.findUnique.mockResolvedValue(null);

    await expect(service.findByToken('bad')).rejects.toThrow(NotFoundException);
  });
});
