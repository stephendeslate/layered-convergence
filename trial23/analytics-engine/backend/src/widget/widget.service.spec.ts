import { Test, TestingModule } from '@nestjs/testing';
import { WidgetService } from './widget.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  widget: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a widget', async () => {
      const data = { name: 'Revenue Chart', type: 'bar', dashboardId: 'dash-1' };
      const created = { id: 'widget-1', ...data, config: {} };

      mockPrismaService.widget.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return widgets for dashboard', async () => {
      const widgets = [{ id: 'widget-1', name: 'W1', dashboardId: 'dash-1' }];
      mockPrismaService.widget.findMany.mockResolvedValue(widgets);

      const result = await service.findAll('dash-1');
      expect(result).toEqual(widgets);
    });
  });

  describe('findOne', () => {
    it('should return widget when found', async () => {
      const widget = { id: 'widget-1', name: 'W1' };
      mockPrismaService.widget.findUnique.mockResolvedValue(widget);

      const result = await service.findOne('widget-1');
      expect(result).toEqual(widget);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.widget.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update widget', async () => {
      const widget = { id: 'widget-1', name: 'Old' };
      mockPrismaService.widget.findUnique.mockResolvedValue(widget);
      mockPrismaService.widget.update.mockResolvedValue({ ...widget, name: 'New' });

      const result = await service.update('widget-1', { name: 'New' });
      expect(result.name).toBe('New');
    });
  });

  describe('remove', () => {
    it('should delete widget', async () => {
      const widget = { id: 'widget-1' };
      mockPrismaService.widget.findUnique.mockResolvedValue(widget);
      mockPrismaService.widget.delete.mockResolvedValue(widget);

      await service.remove('widget-1');
      expect(mockPrismaService.widget.delete).toHaveBeenCalledWith({ where: { id: 'widget-1' } });
    });
  });
});
