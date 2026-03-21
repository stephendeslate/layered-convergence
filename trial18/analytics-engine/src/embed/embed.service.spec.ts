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

  it('should return all embeds for a tenant', async () => {
    const embeds = [{ id: 'e1', tenantId: 't1', dashboardId: 'd1' }];
    prisma.embed.findMany.mockResolvedValue(embeds);

    const result = await service.findAll('t1');

    expect(result).toEqual(embeds);
  });

  it('should throw NotFoundException when embed not found', async () => {
    prisma.embed.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should create an embed', async () => {
    const created = { id: 'e1', tenantId: 't1', dashboardId: 'd1', token: 'tok-123' };
    prisma.embed.create.mockResolvedValue(created);

    const result = await service.create('t1', { dashboardId: 'd1' });

    expect(result).toEqual(created);
  });

  it('should update an embed', async () => {
    prisma.embed.findFirst.mockResolvedValue({ id: 'e1', tenantId: 't1' });
    prisma.embed.update.mockResolvedValue({ id: 'e1', isActive: false });

    const result = await service.update('t1', 'e1', { isActive: false });

    expect(result.isActive).toBe(false);
  });

  it('should delete an embed', async () => {
    prisma.embed.findFirst.mockResolvedValue({ id: 'e1', tenantId: 't1' });
    prisma.embed.delete.mockResolvedValue({ id: 'e1' });

    await service.remove('t1', 'e1');

    expect(prisma.embed.delete).toHaveBeenCalledWith({ where: { id: 'e1' } });
  });
});
