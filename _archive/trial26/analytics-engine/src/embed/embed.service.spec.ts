import { describe, it, expect, beforeEach } from 'vitest';
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an embed config', async () => {
    prisma.embedConfig.create.mockResolvedValue({ id: 'e1', dashboardId: 'd1' });
    const result = await service.create({ dashboardId: 'd1' });
    expect(result.dashboardId).toBe('d1');
  });

  it('should create with default empty arrays and objects', async () => {
    prisma.embedConfig.create.mockResolvedValue({ id: 'e1' });
    await service.create({ dashboardId: 'd1' });
    expect(prisma.embedConfig.create).toHaveBeenCalledWith({
      data: {
        dashboardId: 'd1',
        allowedOrigins: [],
        themeOverrides: {},
      },
    });
  });

  it('should find embed by dashboard id', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue({ id: 'e1', dashboardId: 'd1' });
    const result = await service.findByDashboardId('d1');
    expect(result.id).toBe('e1');
  });

  it('should throw NotFoundException when embed config not found', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(service.findByDashboardId('bad')).rejects.toThrow(NotFoundException);
  });

  it('should update an embed config', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue({ id: 'e1' });
    prisma.embedConfig.update.mockResolvedValue({ id: 'e1', allowedOrigins: ['http://example.com'] });
    const result = await service.update('e1', { allowedOrigins: ['http://example.com'] });
    expect(result.allowedOrigins).toEqual(['http://example.com']);
  });

  it('should throw NotFoundException when updating non-existent embed', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(service.update('bad', { allowedOrigins: [] })).rejects.toThrow(NotFoundException);
  });

  it('should delete an embed config', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue({ id: 'e1' });
    prisma.embedConfig.delete.mockResolvedValue({ id: 'e1' });
    await service.remove('e1');
    expect(prisma.embedConfig.delete).toHaveBeenCalledWith({ where: { id: 'e1' } });
  });

  it('should throw NotFoundException when removing non-existent embed', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue(null);
    await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
  });

  it('should generate embed code', async () => {
    prisma.embedConfig.findFirst.mockResolvedValue({ id: 'e1', dashboardId: 'd1', dashboard: { widgets: [] } });
    const result = await service.generateEmbedCode('d1', 'https://app.example.com');
    expect(result.iframe).toContain('iframe');
    expect(result.iframe).toContain('e1');
    expect(result.scriptTag).toContain('d1');
    expect(result.embedId).toBe('e1');
  });
});
