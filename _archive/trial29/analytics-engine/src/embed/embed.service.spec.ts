import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmbedService } from './embed.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  embedConfig: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  tenant: {
    findFirst: vi.fn(),
  },
  dashboard: {
    findMany: vi.fn(),
  },
};

describe('EmbedService', () => {
  let service: EmbedService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmbedService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(EmbedService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConfig', () => {
    it('should create an embed config', async () => {
      const dto = {
        dashboardId: 'd1',
        allowedOrigins: ['https://example.com'],
      };
      mockPrisma.embedConfig.create.mockResolvedValue({ id: 'ec1', ...dto });

      const result = await service.createConfig(dto);
      expect(result.dashboardId).toBe('d1');
    });
  });

  describe('getConfig', () => {
    it('should return an embed config by dashboardId', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue({
        id: 'ec1',
        dashboardId: 'd1',
      });

      const result = await service.getConfig('d1');
      expect(result.dashboardId).toBe('d1');
    });

    it('should throw NotFoundException if config not found', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(null);

      await expect(service.getConfig('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateConfig', () => {
    it('should update an embed config', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue({ id: 'ec1', dashboardId: 'd1' });
      mockPrisma.embedConfig.update.mockResolvedValue({
        id: 'ec1',
        allowedOrigins: ['https://new.com'],
      });

      const result = await service.updateConfig('d1', {
        allowedOrigins: ['https://new.com'],
      });
      expect(result.allowedOrigins).toContain('https://new.com');
    });
  });

  describe('renderByApiKey', () => {
    it('should return tenant branding and published dashboards', async () => {
      const tenant = {
        id: 't1',
        name: 'Acme',
        primaryColor: '#000',
        fontFamily: 'Arial',
        logoUrl: 'https://logo.com',
        apiKey: 'ak_test',
      };
      mockPrisma.tenant.findFirst.mockResolvedValue(tenant);
      mockPrisma.dashboard.findMany.mockResolvedValue([
        { id: 'd1', isPublished: true, widgets: [], embedConfig: null },
      ]);

      const result = await service.renderByApiKey('ak_test');
      expect(result.tenant.name).toBe('Acme');
      expect(result.dashboards).toHaveLength(1);
    });

    it('should throw NotFoundException for invalid API key', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue(null);

      await expect(service.renderByApiKey('bad_key')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
