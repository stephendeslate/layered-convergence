import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmbedConfigsService } from './embed-configs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EmbedConfigsService', () => {
  let service: EmbedConfigsService;
  let prisma: any;

  const mockConfig = {
    id: 'ec-1',
    dashboardId: 'dash-1',
    allowedOrigins: ['https://example.com'],
    themeOverrides: null,
  };

  beforeEach(async () => {
    prisma = {
      embedConfig: {
        create: vi.fn().mockResolvedValue(mockConfig),
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue(mockConfig),
        delete: vi.fn().mockResolvedValue(mockConfig),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbedConfigsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmbedConfigsService>(EmbedConfigsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an embed config', async () => {
      const result = await service.create({
        dashboardId: 'dash-1',
        allowedOrigins: ['https://example.com'],
      });
      expect(result).toEqual(mockConfig);
    });
  });

  describe('findByDashboard', () => {
    it('should return config when found', async () => {
      prisma.embedConfig.findUnique.mockResolvedValue(mockConfig);
      const result = await service.findByDashboard('dash-1');
      expect(result.dashboardId).toBe('dash-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.embedConfig.findUnique.mockResolvedValue(null);
      await expect(service.findByDashboard('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update allowed origins', async () => {
      await service.update('dash-1', { allowedOrigins: ['https://new.com'] });
      expect(prisma.embedConfig.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { dashboardId: 'dash-1' },
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete embed config', async () => {
      await service.remove('dash-1');
      expect(prisma.embedConfig.delete).toHaveBeenCalledWith({
        where: { dashboardId: 'dash-1' },
      });
    });
  });
});
