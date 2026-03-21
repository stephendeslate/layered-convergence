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
    themeOverrides: { primaryColor: '#FF0000' },
    dashboard: { id: 'dash-1', widgets: [] },
  };

  beforeEach(async () => {
    prisma = {
      embedConfig: {
        create: vi.fn().mockResolvedValue(mockEmbed),
        findFirst: vi.fn().mockResolvedValue(mockEmbed),
        update: vi.fn().mockResolvedValue({
          ...mockEmbed,
          allowedOrigins: ['https://new.com'],
        }),
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
    expect(result).toEqual(mockEmbed);
  });

  it('should create with default values', async () => {
    await service.create({ dashboardId: 'dash-1' });
    expect(prisma.embedConfig.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        allowedOrigins: [],
        themeOverrides: {},
      }),
    });
  });

  it('should find embed by dashboard id', async () => {
    const result = await service.findByDashboardId('dash-1');
    expect(result).toEqual(mockEmbed);
  });

  it('should throw NotFoundException when embed not found', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(service.findByDashboardId('dash-999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update an embed config', async () => {
    const result = await service.update('embed-1', {
      allowedOrigins: ['https://new.com'],
    });
    expect(result.allowedOrigins).toEqual(['https://new.com']);
  });

  it('should throw NotFoundException on update if not found', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(
      service.update('embed-999', { allowedOrigins: [] }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should remove an embed config', async () => {
    const result = await service.remove('embed-1');
    expect(result).toEqual(mockEmbed);
  });

  it('should throw NotFoundException on remove if not found', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(service.remove('embed-999')).rejects.toThrow(NotFoundException);
  });

  it('should generate embed code', async () => {
    const result = await service.generateEmbedCode('dash-1', 'https://api.example.com');
    expect(result.iframe).toContain('iframe');
    expect(result.iframe).toContain('embed-1');
    expect(result.scriptTag).toContain('script');
    expect(result.embedId).toBe('embed-1');
  });
});
