import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller.js';
import { CompanyService } from './company.service.js';

const mockService = {
  create: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('CompanyController', () => {
  let controller: CompanyController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [{ provide: CompanyService, useValue: mockService }],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on service', async () => {
    const dto = { name: 'Test Co' };
    const expected = { id: 'uuid', ...dto };
    mockService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);
    expect(result).toEqual(expected);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findOne on service', async () => {
    const expected = { id: 'uuid', name: 'Test' };
    mockService.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('uuid');
    expect(result).toEqual(expected);
  });

  it('should call update on service', async () => {
    const dto = { name: 'Updated' };
    const expected = { id: 'uuid', ...dto };
    mockService.update.mockResolvedValue(expected);

    const result = await controller.update('uuid', dto);
    expect(result).toEqual(expected);
  });

  it('should call remove on service', async () => {
    const expected = { id: 'uuid', name: 'Deleted' };
    mockService.remove.mockResolvedValue(expected);

    const result = await controller.remove('uuid');
    expect(result).toEqual(expected);
  });
});
