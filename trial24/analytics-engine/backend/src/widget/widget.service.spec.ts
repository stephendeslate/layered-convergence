import { Test, TestingModule } from '@nestjs/testing';
import { WidgetService } from './widget.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  widget: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
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
      const data = { name: 'Revenue Chart', type: 'bar-chart', dashboardId: 'd-1' };
      const created = { id: 'w-1', ...data, config: {} };

      mockPrismaService.widget.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result.name).toBe('Revenue Chart');
      expect(result.type).toBe('bar-chart');
    });
  });

  describe('findAll', () => {
    it('should return all widgets for dashboard', async () => {
      mockPrismaService.widget.findMany.mockResolvedValue([]);
      const result = await service.findAll('d-1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return widget by id', async () => {
      const widget = { id: 'w-1', name: 'Test', type: 'line-chart' };
      mockPrismaService.widget.findFirst.mockResolvedValue(widget);

      const result = await service.findOne('w-1');
      expect(result.id).toBe('w-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.widget.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a widget', async () => {
      const widget = { id: 'w-1', name: 'Test', type: 'line-chart' };
      mockPrismaService.widget.findFirst.mockResolvedValue(widget);
      mockPrismaService.widget.update.mockResolvedValue({ ...widget, name: 'Updated Chart' });

      const result = await service.update('w-1', { name: 'Updated Chart' });
      expect(result.name).toBe('Updated Chart');
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      const widget = { id: 'w-1', name: 'Test' };
      mockPrismaService.widget.findFirst.mockResolvedValue(widget);
      mockPrismaService.widget.delete.mockResolvedValue(widget);

      const result = await service.remove('w-1');
      expect(result.id).toBe('w-1');
    });
  });
});
