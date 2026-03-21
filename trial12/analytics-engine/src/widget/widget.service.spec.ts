import { WidgetService } from './widget.service.js';
import { NotFoundException } from '@nestjs/common';

describe('WidgetService', () => {
  let service: WidgetService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      widget: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new WidgetService(mockPrisma);
  });

  describe('create', () => {
    it('should create a widget', async () => {
      const dto = {
        dashboardId: 'd1',
        type: 'LINE_CHART' as any,
        config: {},
        positionX: 0,
        positionY: 0,
        width: 4,
        height: 3,
      };
      mockPrisma.widget.create.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create(dto);
      expect(result).toBeDefined();
    });
  });

  describe('findAllByDashboard', () => {
    it('should return widgets for a dashboard', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([]);
      const result = await service.findAllByDashboard('d1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({ id: '1' });
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.widget.update.mockResolvedValue({ id: '1', width: 6 });
      const result = await service.update('1', { width: 6 });
      expect(result.width).toBe(6);
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.widget.delete.mockResolvedValue({ id: '1' });
      await service.remove('1');
      expect(mockPrisma.widget.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
