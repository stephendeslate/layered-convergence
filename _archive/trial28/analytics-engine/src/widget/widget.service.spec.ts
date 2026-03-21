import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  widget: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(WidgetService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a widget', async () => {
      const dto = {
        dashboardId: 'd1',
        type: 'LINE_CHART' as const,
        config: {},
        positionX: 0,
        positionY: 0,
        width: 4,
        height: 3,
      };
      mockPrisma.widget.create.mockResolvedValue({ id: 'w1', ...dto });

      const result = await service.create(dto);
      expect(mockPrisma.widget.create).toHaveBeenCalledWith({ data: dto });
      expect(result.id).toBe('w1');
    });
  });

  describe('findAllByDashboard', () => {
    it('should return widgets for a dashboard', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([{ id: 'w1' }]);

      const result = await service.findAllByDashboard('d1');
      expect(mockPrisma.widget.findMany).toHaveBeenCalledWith({
        where: { dashboardId: 'd1' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a widget by id', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({ id: 'w1' });

      const result = await service.findOne('w1');
      expect(result.id).toBe('w1');
    });

    it('should throw NotFoundException if widget not found', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({ id: 'w1' });
      mockPrisma.widget.update.mockResolvedValue({ id: 'w1', width: 6 });

      const result = await service.update('w1', { width: 6 });
      expect(result.width).toBe(6);
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      mockPrisma.widget.findUnique.mockResolvedValue({ id: 'w1' });
      mockPrisma.widget.delete.mockResolvedValue({ id: 'w1' });

      const result = await service.remove('w1');
      expect(mockPrisma.widget.delete).toHaveBeenCalledWith({
        where: { id: 'w1' },
      });
      expect(result).toBeDefined();
    });
  });
});
