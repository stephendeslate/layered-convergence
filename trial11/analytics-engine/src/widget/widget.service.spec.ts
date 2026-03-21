import { Test, TestingModule } from '@nestjs/testing';
import { WidgetService } from './widget.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  widget: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a widget with defaults', async () => {
      const dto = { type: 'LINE_CHART' as const, config: { label: 'Revenue' } };
      const expected = { id: '1', ...dto, positionX: 0, positionY: 0, width: 4, height: 3 };
      mockPrisma.widget.create.mockResolvedValue(expected);

      const result = await service.create('dash-1', dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.widget.create).toHaveBeenCalledWith({
        data: {
          dashboardId: 'dash-1',
          type: 'LINE_CHART',
          config: { label: 'Revenue' },
          positionX: 0,
          positionY: 0,
          width: 4,
          height: 3,
        },
      });
    });

    it('should create a widget with custom position', async () => {
      const dto = {
        type: 'BAR_CHART' as const,
        config: {},
        positionX: 2,
        positionY: 3,
        width: 6,
        height: 4,
      };
      mockPrisma.widget.create.mockResolvedValue({ id: '1', ...dto });

      await service.create('dash-1', dto);

      expect(mockPrisma.widget.create).toHaveBeenCalledWith({
        data: {
          dashboardId: 'dash-1',
          type: 'BAR_CHART',
          config: {},
          positionX: 2,
          positionY: 3,
          width: 6,
          height: 4,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return widgets for a dashboard', async () => {
      const widgets = [{ id: '1', dashboardId: 'dash-1' }];
      mockPrisma.widget.findMany.mockResolvedValue(widgets);

      const result = await service.findAll('dash-1');

      expect(result).toEqual(widgets);
    });
  });

  describe('findById', () => {
    it('should return a widget', async () => {
      const widget = { id: '1', type: 'PIE_CHART' };
      mockPrisma.widget.findUniqueOrThrow.mockResolvedValue(widget);

      const result = await service.findById('1');

      expect(result).toEqual(widget);
    });
  });

  describe('update', () => {
    it('should update a widget', async () => {
      const dto = { config: { newProp: true } };
      mockPrisma.widget.update.mockResolvedValue({ id: '1', ...dto });

      const result = await service.update('1', dto);

      expect(result).toEqual({ id: '1', ...dto });
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      mockPrisma.widget.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');

      expect(result).toEqual({ id: '1' });
    });
  });
});
