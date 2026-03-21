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
    allowedOrigins: ['https://example.com'],
    themeOverrides: { primaryColor: '#333' },
    dashboard: { id: 'dash-1', widgets: [] },
  };

  beforeEach(async () => {
    prisma = {
      embedConfig: {
        create: vi.fn().mockResolvedValue(mockEmbed),
        findFirst: vi.fn().mockResolvedValue(mockEmbed),
        update: vi.fn().mockResolvedValue({ ...mockEmbed, allowedOrigins: ['https://new.com'] }),
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
    const result = await service.create({
      dashboardId: 'dash-1',
      allowedOrigins: ['https://example.com'],
      themeOverrides: { primaryColor: '#333' },
    });
    expect(result).toEqual(mockEmbed);
  });

  it('should create an embed config with defaults', async () => {
    await service.create({ dashboardId: 'dash-1' });
    expect(prisma.embedConfig.create).toHaveBeenCalledWith({
      data: { dashboardId: 'dash-1', allowedOrigins: [], themeOverrides: {} },
    });
  });

  it('should find embed by dashboard id', async () => {
    const result = await service.findByDashboardId('dash-1');
    expect(result).toEqual(mockEmbed);
    expect(prisma.embedConfig.findFirst).toHaveBeenCalledWith({
      where: { dashboardId: 'dash-1' },
      include: { dashboard: { include: { widgets: true } } },
    });
  });

  it('should throw NotFoundException when embed not found by dashboard id', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(service.findByDashboardId('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update an embed config', async () => {
    const result = await service.update('embed-1', { allowedOrigins: ['https://new.com'] });
    expect(result.allowedOrigins).toEqual(['https://new.com']);
  });

  it('should throw NotFoundException when updating non-existent embed', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(service.update('missing', { allowedOrigins: [] })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should remove an embed config', async () => {
    const result = await service.remove('embed-1');
    expect(result).toEqual(mockEmbed);
  });

  it('should throw NotFoundException when removing non-existent embed', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });

  it('should generate embed code', async () => {
    const result = await service.generateEmbedCode('dash-1', 'https://app.example.com');
    expect(result.iframe).toContain('iframe');
    expect(result.iframe).toContain('embed-1');
    expect(result.scriptTag).toContain('script');
    expect(result.scriptTag).toContain('dash-1');
    expect(result.embedId).toBe('embed-1');
  });

  it('should throw NotFoundException when generating embed code for missing dashboard', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(
      service.generateEmbedCode('missing', 'https://app.example.com'),
    ).rejects.toThrow(NotFoundException);
  });
});
