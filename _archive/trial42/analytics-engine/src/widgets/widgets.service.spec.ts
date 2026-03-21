import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WidgetsService', () => {
  let service: WidgetsService;
  let prisma: any;

  const mockWidget = {
    id: 'widget-1',
    dashboardId: 'dash-1',
    type: 'LINE_CHART',
    config: { title: 'Views' },
    positionX: 0,
    positionY: 0,
    width: 2,
    height: 1,
  };

  beforeEach(async () => {
    prisma = {
      widget: {
        create: vi.fn().mockResolvedValue(mockWidget),
        findMany: vi.fn().mockResolvedValue([mockWidget]),
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue(mockWidget),
        delete: vi.fn().mockResolvedValue(mockWidget),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WidgetsService>(WidgetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a widget', async () => {
      const result = await service.create({
        dashboardId: 'dash-1',
        type: 'LINE_CHART',
        config: { title: 'Views' },
      });
      expect(result).toEqual(mockWidget);
    });

    it('should default position to 0,0', async () => {
      await service.create({ dashboardId: 'dash-1', type: 'BAR_CHART', config: {} });
      expect(prisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ positionX: 0, positionY: 0 }),
        }),
      );
    });

    it('should default size to 1x1', async () => {
      await service.create({ dashboardId: 'dash-1', type: 'PIE_CHART', config: {} });
      expect(prisma.widget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ width: 1, height: 1 }),
        }),
      );
    });
  });

  describe('findByDashboard', () => {
    it('should return widgets for dashboard', async () => {
      const result = await service.findByDashboard('dash-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return widget when found', async () => {
      prisma.widget.findUnique.mockResolvedValue(mockWidget);
      const result = await service.findById('widget-1');
      expect(result.id).toBe('widget-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.widget.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update widget config', async () => {
      await service.update('widget-1', { config: { title: 'New' } });
      expect(prisma.widget.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete widget', async () => {
      await service.remove('widget-1');
      expect(prisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'widget-1' } });
    });
  });
});
