import { Test, TestingModule } from '@nestjs/testing';
import { DataPointController } from './data-point.controller.js';
import { DataPointService } from './data-point.service.js';

const mockDataPointService = {
  query: vi.fn(),
};

const mockRequest = { tenantId: 'tenant-1' };

describe('DataPointController', () => {
  let controller: DataPointController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataPointController],
      providers: [
        { provide: DataPointService, useValue: mockDataPointService },
      ],
    }).compile();

    controller = module.get<DataPointController>(DataPointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('query', () => {
    it('should query data points', async () => {
      const dto = {
        dataSourceId: 'ds-1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      const expected = [{ id: '1' }];
      mockDataPointService.query.mockResolvedValue(expected);

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.query(mockRequest as any, dto);

      expect(result).toEqual(expected);
      expect(mockDataPointService.query).toHaveBeenCalledWith('tenant-1', dto);
    });
  });
});
