import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmbedService', () => {
  let service: EmbedService;
  let prisma: {
    embed: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    dashboard: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const tenantId = 'tenant-1';
  const otherTenantId = 'tenant-2';

  const mockEmbed = {
    id: 'emb-1',
    tenantId,
    dashboardId: 'db-1',
    token: 'token-abc-123',
    allowedOrigins: ['https://example.com'],
    isActive: true,
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      embed: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      dashboard: {
        findFirst: vi.fn(),
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
    const createDto = {
      dashboardId: 'db-1',
      allowedOrigins: ['https://example.com'],
    };

    it('should create an embed when dashboard exists', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'db-1', tenantId });
      prisma.embed.create.mockResolvedValue(mockEmbed);

      const result = await service.create(tenantId, createDto);

      expect(result.token).toBe('token-abc-123');
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.create(tenantId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should verify dashboard belongs to tenant', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.create(otherTenantId, createDto),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'db-1', tenantId: otherTenantId },
      });
    });

    it('should create embed with expiration date', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'db-1', tenantId });
      prisma.embed.create.mockResolvedValue({
        ...mockEmbed,
        expiresAt: new Date('2026-12-31'),
      });

      await service.create(tenantId, {
        ...createDto,
        expiresAt: '2026-12-31',
      });

      expect(prisma.embed.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          expiresAt: expect.any(Date),
        }),
      });
    });

    it('should include tenantId in created embed', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'db-1', tenantId });
      prisma.embed.create.mockResolvedValue(mockEmbed);

      await service.create(tenantId, createDto);

      expect(prisma.embed.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId }),
      });
    });
  });

  describe('findAll', () => {
    it('should return embeds with dashboard data', async () => {
      prisma.embed.findMany.mockResolvedValue([
        { ...mockEmbed, dashboard: { id: 'db-1', name: 'Sales' } },
      ]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(1);
    });

    it('should filter by tenantId', async () => {
      prisma.embed.findMany.mockResolvedValue([]);

      await service.findAll(tenantId);

      expect(prisma.embed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId } }),
      );
    });

    it('should return empty array for tenant with no embeds', async () => {
      prisma.embed.findMany.mockResolvedValue([]);

      const result = await service.findAll(otherTenantId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return an embed with dashboard', async () => {
      prisma.embed.findFirst.mockResolvedValue({
        ...mockEmbed,
        dashboard: { id: 'db-1' },
      });

      const result = await service.findOne(tenantId, 'emb-1');

      expect(result.id).toBe('emb-1');
    });

    it('should throw NotFoundException if embed not found', async () => {
      prisma.embed.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'emb-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should use tenantId for isolation', async () => {
      prisma.embed.findFirst.mockResolvedValue(null);

      await expect(service.findOne(otherTenantId, 'emb-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByToken', () => {
    it('should return embed with dashboard and widgets', async () => {
      prisma.embed.findUnique.mockResolvedValue({
        ...mockEmbed,
        dashboard: { id: 'db-1', widgets: [{ id: 'w-1' }] },
      });

      const result = await service.findByToken('token-abc-123');

      expect(result.id).toBe('emb-1');
    });

    it('should throw NotFoundException for non-existent token', async () => {
      prisma.embed.findUnique.mockResolvedValue(null);

      await expect(service.findByToken('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for inactive embed', async () => {
      prisma.embed.findUnique.mockResolvedValue({
        ...mockEmbed,
        isActive: false,
      });

      await expect(service.findByToken('token-abc-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for expired embed', async () => {
      prisma.embed.findUnique.mockResolvedValue({
        ...mockEmbed,
        expiresAt: new Date('2020-01-01'),
      });

      await expect(service.findByToken('token-abc-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow non-expired embed', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      prisma.embed.findUnique.mockResolvedValue({
        ...mockEmbed,
        expiresAt: futureDate,
        dashboard: { id: 'db-1', widgets: [] },
      });

      const result = await service.findByToken('token-abc-123');

      expect(result.id).toBe('emb-1');
    });

    it('should allow embed with no expiration', async () => {
      prisma.embed.findUnique.mockResolvedValue({
        ...mockEmbed,
        expiresAt: null,
        dashboard: { id: 'db-1', widgets: [] },
      });

      const result = await service.findByToken('token-abc-123');

      expect(result.id).toBe('emb-1');
    });
  });

  describe('update', () => {
    it('should update allowed origins', async () => {
      prisma.embed.findFirst.mockResolvedValue({
        ...mockEmbed,
        dashboard: { id: 'db-1' },
      });
      prisma.embed.update.mockResolvedValue({
        ...mockEmbed,
        allowedOrigins: ['https://new-site.com'],
      });

      const result = await service.update(tenantId, 'emb-1', {
        allowedOrigins: ['https://new-site.com'],
      });

      expect(result.allowedOrigins).toContain('https://new-site.com');
    });

    it('should update isActive', async () => {
      prisma.embed.findFirst.mockResolvedValue({
        ...mockEmbed,
        dashboard: { id: 'db-1' },
      });
      prisma.embed.update.mockResolvedValue({ ...mockEmbed, isActive: false });

      const result = await service.update(tenantId, 'emb-1', {
        isActive: false,
      });

      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException if embed not found', async () => {
      prisma.embed.findFirst.mockResolvedValue(null);

      await expect(
        service.update(tenantId, 'emb-999', { isActive: false }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should prevent updating embed from another tenant', async () => {
      prisma.embed.findFirst.mockResolvedValue(null);

      await expect(
        service.update(otherTenantId, 'emb-1', { isActive: false }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an embed', async () => {
      prisma.embed.findFirst.mockResolvedValue({
        ...mockEmbed,
        dashboard: { id: 'db-1' },
      });
      prisma.embed.delete.mockResolvedValue(mockEmbed);

      await service.remove(tenantId, 'emb-1');

      expect(prisma.embed.delete).toHaveBeenCalledWith({ where: { id: 'emb-1' } });
    });

    it('should throw NotFoundException if embed not found', async () => {
      prisma.embed.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'emb-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should prevent deleting embed from another tenant', async () => {
      prisma.embed.findFirst.mockResolvedValue(null);

      await expect(service.remove(otherTenantId, 'emb-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
