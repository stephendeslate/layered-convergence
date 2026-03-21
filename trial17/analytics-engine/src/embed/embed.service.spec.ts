import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmbedService', () => {
  let service: EmbedService;
  let prisma: {
    dashboard: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    embed: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  const tenantId = 'tenant-1';

  const mockEmbed = {
    id: 'emb-1',
    tenantId,
    dashboardId: 'db-1',
    token: 'abc-token-123',
    allowedOrigins: ['https://example.com'],
    isActive: true,
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    dashboard: { id: 'db-1', name: 'Sales Dashboard' },
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        findFirst: vi.fn(),
      },
      embed: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbedService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmbedService>(EmbedService);
  });

  describe('create', () => {
    it('should create an embed when dashboard exists', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'db-1', tenantId });
      prisma.embed.create.mockResolvedValue(mockEmbed);

      const result = await service.create(tenantId, {
        dashboardId: 'db-1',
        allowedOrigins: ['https://example.com'],
      });

      expect(result.id).toBe('emb-1');
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, {
          dashboardId: 'db-999',
          allowedOrigins: ['https://example.com'],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should verify dashboard belongs to tenant', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, {
          dashboardId: 'db-other',
          allowedOrigins: [],
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'db-other', tenantId },
      });
    });
  });

  describe('findAll', () => {
    it('should return all embeds for tenant', async () => {
      prisma.embed.findMany.mockResolvedValue([mockEmbed]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(1);
      expect(prisma.embed.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { dashboard: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an embed', async () => {
      prisma.embed.findFirst.mockResolvedValue(mockEmbed);

      const result = await service.findOne(tenantId, 'emb-1');

      expect(result.id).toBe('emb-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.embed.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'emb-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByToken', () => {
    it('should return embed with dashboard and widgets', async () => {
      prisma.embed.findUnique.mockResolvedValue({
        ...mockEmbed,
        dashboard: { id: 'db-1', widgets: [] },
      });

      const result = await service.findByToken('abc-token-123');

      expect(result.token).toBe('abc-token-123');
      expect(prisma.embed.findUnique).toHaveBeenCalledWith({
        where: { token: 'abc-token-123' },
        include: { dashboard: { include: { widgets: true } } },
      });
    });

    it('should throw NotFoundException if token not found', async () => {
      prisma.embed.findUnique.mockResolvedValue(null);

      await expect(service.findByToken('bad-token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if embed is inactive', async () => {
      prisma.embed.findUnique.mockResolvedValue({
        ...mockEmbed,
        isActive: false,
      });

      await expect(service.findByToken('abc-token-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if embed has expired', async () => {
      prisma.embed.findUnique.mockResolvedValue({
        ...mockEmbed,
        expiresAt: new Date('2020-01-01'),
      });

      await expect(service.findByToken('abc-token-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow active embed with future expiration', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      prisma.embed.findUnique.mockResolvedValue({
        ...mockEmbed,
        expiresAt: futureDate,
        dashboard: { id: 'db-1', widgets: [] },
      });

      const result = await service.findByToken('abc-token-123');

      expect(result.token).toBe('abc-token-123');
    });
  });

  describe('update', () => {
    it('should update an embed', async () => {
      prisma.embed.findFirst.mockResolvedValue(mockEmbed);
      prisma.embed.update.mockResolvedValue({ ...mockEmbed, isActive: false });

      const result = await service.update(tenantId, 'emb-1', { isActive: false });

      expect(result.isActive).toBe(false);
    });
  });

  describe('remove', () => {
    it('should delete an embed', async () => {
      prisma.embed.findFirst.mockResolvedValue(mockEmbed);
      prisma.embed.delete.mockResolvedValue(mockEmbed);

      await service.remove(tenantId, 'emb-1');

      expect(prisma.embed.delete).toHaveBeenCalledWith({ where: { id: 'emb-1' } });
    });
  });
});
