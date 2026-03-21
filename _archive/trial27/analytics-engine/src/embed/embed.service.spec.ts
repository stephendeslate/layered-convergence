import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmbedService', () => {
  let service: EmbedService;
  let prisma: {
    embedConfig: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      embedConfig: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        EmbedService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(EmbedService);
  });

  describe('create', () => {
    it('should create embed config', async () => {
      prisma.embedConfig.create.mockResolvedValue({ id: 'e-1', dashboardId: 'd-1' });
      const result = await service.create({ dashboardId: 'd-1' });
      expect(result.id).toBe('e-1');
    });

    it('should default allowedOrigins to empty array', async () => {
      prisma.embedConfig.create.mockResolvedValue({ id: 'e-1' });
      await service.create({ dashboardId: 'd-1' });
      expect(prisma.embedConfig.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ allowedOrigins: [] }),
        }),
      );
    });

    it('should default themeOverrides to empty object', async () => {
      prisma.embedConfig.create.mockResolvedValue({ id: 'e-1' });
      await service.create({ dashboardId: 'd-1' });
      expect(prisma.embedConfig.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ themeOverrides: {} }),
        }),
      );
    });
  });

  describe('findByDashboardId', () => {
    it('should return embed config with dashboard', async () => {
      prisma.embedConfig.findFirst.mockResolvedValue({
        id: 'e-1',
        dashboardId: 'd-1',
        dashboard: { widgets: [] },
      });
      const result = await service.findByDashboardId('d-1');
      expect(result.id).toBe('e-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.embedConfig.findFirst.mockResolvedValue(null);
      await expect(service.findByDashboardId('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update embed config', async () => {
      prisma.embedConfig.findFirst.mockResolvedValue({ id: 'e-1' });
      prisma.embedConfig.update.mockResolvedValue({ id: 'e-1', allowedOrigins: ['http://localhost'] });
      const result = await service.update('e-1', { allowedOrigins: ['http://localhost'] });
      expect(result.allowedOrigins).toEqual(['http://localhost']);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.embedConfig.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete embed config', async () => {
      prisma.embedConfig.findFirst.mockResolvedValue({ id: 'e-1' });
      prisma.embedConfig.delete.mockResolvedValue({ id: 'e-1' });
      const result = await service.remove('e-1');
      expect(result.id).toBe('e-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.embedConfig.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateEmbedCode', () => {
    it('should generate iframe and script tags', async () => {
      prisma.embedConfig.findFirst.mockResolvedValue({
        id: 'e-1',
        dashboardId: 'd-1',
        dashboard: { widgets: [] },
      });
      const result = await service.generateEmbedCode('d-1', 'http://localhost:3000');
      expect(result.iframe).toContain('iframe');
      expect(result.scriptTag).toContain('script');
      expect(result.embedId).toBe('e-1');
    });

    it('should include embed id in iframe src', async () => {
      prisma.embedConfig.findFirst.mockResolvedValue({
        id: 'e-1',
        dashboardId: 'd-1',
        dashboard: { widgets: [] },
      });
      const result = await service.generateEmbedCode('d-1', 'http://localhost:3000');
      expect(result.iframe).toContain('e-1');
    });
  });
});
