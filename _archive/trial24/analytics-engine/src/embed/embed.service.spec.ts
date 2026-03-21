import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  const mockEmbed = {
    id: 'embed-1',
    dashboardId: 'dash-1',
    allowedOrigins: ['http://localhost:3000'],
    themeOverrides: {},
    dashboard: { id: 'dash-1', widgets: [] },
  };

  beforeEach(async () => {
    prisma = {
      embedConfig: {
        create: vi.fn().mockResolvedValue(mockEmbed),
        findFirst: vi.fn().mockResolvedValue(mockEmbed),
        update: vi.fn().mockResolvedValue({ ...mockEmbed, allowedOrigins: ['https://example.com'] }),
        delete: vi.fn().mockResolvedValue(mockEmbed),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        EmbedService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmbedService>(EmbedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an embed config', async () => {
    const result = await service.create({ dashboardId: 'dash-1' });
    expect(result.id).toBe('embed-1');
  });

  it('should default allowedOrigins to empty array', async () => {
    await service.create({ dashboardId: 'dash-1' });
    expect(prisma.embedConfig.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ allowedOrigins: [] }),
    });
  });

  it('should default themeOverrides to empty object', async () => {
    await service.create({ dashboardId: 'dash-1' });
    expect(prisma.embedConfig.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ themeOverrides: {} }),
    });
  });

  it('should find embed config by dashboard id', async () => {
    const result = await service.findByDashboardId('dash-1');
    expect(result.dashboardId).toBe('dash-1');
  });

  it('should throw NotFoundException when embed config not found', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(service.findByDashboardId('missing')).rejects.toThrow(NotFoundException);
  });

  it('should update an embed config', async () => {
    const result = await service.update('embed-1', {
      allowedOrigins: ['https://example.com'],
    });
    expect(result.allowedOrigins).toEqual(['https://example.com']);
  });

  it('should throw NotFoundException when updating non-existent embed', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(
      service.update('missing', { allowedOrigins: ['https://x.com'] }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should remove an embed config', async () => {
    await service.remove('embed-1');
    expect(prisma.embedConfig.delete).toHaveBeenCalledWith({ where: { id: 'embed-1' } });
  });

  it('should throw NotFoundException when removing non-existent embed', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });

  it('should generate embed code', async () => {
    const result = await service.generateEmbedCode('dash-1', 'http://localhost:3000');
    expect(result.iframe).toContain('iframe');
    expect(result.scriptTag).toContain('script');
    expect(result.embedId).toBe('embed-1');
  });

  it('should include dashboard id in script tag', async () => {
    const result = await service.generateEmbedCode('dash-1', 'http://localhost:3000');
    expect(result.scriptTag).toContain('dash-1');
  });
});
