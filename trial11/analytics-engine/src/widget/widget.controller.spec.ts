import { Test, TestingModule } from '@nestjs/testing';
import { WidgetController } from './widget.controller.js';
import { WidgetService } from './widget.service.js';

const mockWidgetService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('WidgetController', () => {
  let controller: WidgetController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WidgetController],
      providers: [{ provide: WidgetService, useValue: mockWidgetService }],
    }).compile();

    controller = module.get<WidgetController>(WidgetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a widget', async () => {
      const dto = { type: 'LINE_CHART' as const, config: {} };
      const expected = { id: '1', ...dto };
      mockWidgetService.create.mockResolvedValue(expected);

      const result = await controller.create('dash-1', dto);

      expect(result).toEqual(expected);
      expect(mockWidgetService.create).toHaveBeenCalledWith('dash-1', dto);
    });
  });

  describe('findAll', () => {
    it('should return widgets', async () => {
      mockWidgetService.findAll.mockResolvedValue([]);

      const result = await controller.findAll('dash-1');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a widget', async () => {
      const expected = { id: '1' };
      mockWidgetService.findById.mockResolvedValue(expected);

      const result = await controller.findById('1');

      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should update a widget', async () => {
      const dto = { config: {} };
      mockWidgetService.update.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.update('1', dto);

      expect(result).toEqual({ id: '1', ...dto });
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      mockWidgetService.remove.mockResolvedValue({ id: '1' });

      const result = await controller.remove('1');

      expect(result).toEqual({ id: '1' });
    });
  });
});
