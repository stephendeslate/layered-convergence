import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EmbedService } from './embed.service';

function createMockPrisma(configExists = true) {
  return {
    embedConfig: {
      create: async (args: any) => ({ id: 'ec-1', ...args.data }),
      findUnique: async () =>
        configExists
          ? {
              id: 'ec-1',
              dashboardId: 'dash-1',
              allowedOrigins: ['https://example.com'],
              dashboard: { id: 'dash-1', widgets: [], tenant: { id: 't-1' } },
            }
          : null,
      findUniqueOrThrow: async () => ({
        id: 'ec-1',
        dashboardId: 'dash-1',
        dashboard: { id: 'dash-1', widgets: [], tenant: { id: 't-1' } },
      }),
      update: async (args: any) => ({ id: args.where.id, ...args.data }),
      delete: async (args: any) => ({ id: args.where.id }),
    },
  } as any;
}

describe('EmbedService', () => {
  let service: EmbedService;

  beforeEach(() => {
    service = new EmbedService(createMockPrisma());
  });

  it('should create an embed config', async () => {
    const result = await service.create({
      dashboardId: 'dash-1',
      allowedOrigins: ['https://example.com'],
    });
    expect(result.dashboardId).toBe('dash-1');
  });

  it('should find embed config by dashboard', async () => {
    const result = await service.findByDashboard('dash-1');
    expect(result).toBeDefined();
    expect(result!.dashboardId).toBe('dash-1');
  });

  it('should find one embed config', async () => {
    const result = await service.findOne('ec-1');
    expect(result.id).toBe('ec-1');
  });

  it('should update an embed config', async () => {
    const result = await service.update('ec-1', {
      allowedOrigins: ['https://new.example.com'],
    });
    expect(result.allowedOrigins).toEqual(['https://new.example.com']);
  });

  it('should delete an embed config', async () => {
    const result = await service.remove('ec-1');
    expect(result.id).toBe('ec-1');
  });

  it('should resolve embed for allowed origin', async () => {
    const result = await service.resolveEmbed('dash-1', 'https://example.com');
    expect(result.dashboardId).toBe('dash-1');
  });

  it('should reject embed for disallowed origin', async () => {
    await expect(
      service.resolveEmbed('dash-1', 'https://evil.com'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw not found when no embed config exists', async () => {
    service = new EmbedService(createMockPrisma(false));
    await expect(service.resolveEmbed('dash-1')).rejects.toThrow(NotFoundException);
  });

  it('should resolve embed without origin check when no origins configured', async () => {
    const mockPrisma = createMockPrisma();
    mockPrisma.embedConfig.findUnique = async () => ({
      id: 'ec-1',
      dashboardId: 'dash-1',
      allowedOrigins: [],
      dashboard: { id: 'dash-1', widgets: [], tenant: { id: 't-1' } },
    });
    service = new EmbedService(mockPrisma);
    const result = await service.resolveEmbed('dash-1', 'https://any.com');
    expect(result).toBeDefined();
  });
});
