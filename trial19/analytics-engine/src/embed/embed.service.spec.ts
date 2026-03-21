import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmbedService', () => {
  let service: EmbedService;
  let prisma: {
    embed: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      embed: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new EmbedService(prisma as unknown as PrismaService);
  });

  it('should find all embeds for a tenant', async () => {
    prisma.embed.findMany.mockResolvedValue([]);
    const result = await service.findAll('t1');
    expect(result).toEqual([]);
  });

  it('should throw NotFoundException when embed not found', async () => {
    prisma.embed.findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when token embed not found', async () => {
    prisma.embed.findFirst.mockResolvedValue(null);
    await expect(service.findByToken('bad-token')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when embed expired', async () => {
    prisma.embed.findFirst.mockResolvedValue({
      id: 'e1',
      isActive: true,
      expiresAt: new Date('2020-01-01'),
      dashboard: { widgets: [] },
    });
    await expect(service.findByToken('token')).rejects.toThrow(NotFoundException);
  });

  it('should create an embed', async () => {
    const created = { id: 'e1', token: 'abc', tenantId: 't1', dashboard: {} };
    prisma.embed.create.mockResolvedValue(created);

    const result = await service.create('t1', { dashboardId: 'd1' });
    expect(result.token).toBe('abc');
  });

  it('should delete an embed', async () => {
    prisma.embed.findFirst.mockResolvedValue({ id: 'e1', tenantId: 't1' });
    prisma.embed.delete.mockResolvedValue({ id: 'e1' });

    await service.remove('t1', 'e1');
    expect(prisma.embed.delete).toHaveBeenCalledWith({ where: { id: 'e1' } });
  });
});
