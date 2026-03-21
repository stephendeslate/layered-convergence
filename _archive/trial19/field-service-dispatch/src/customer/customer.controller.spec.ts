import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller.js';
import { CustomerService } from './customer.service.js';
import { Request } from 'express';

const mockService = {
  create: vi.fn(),
  findAllByCompany: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const makeReq = (companyId = 'co-1') =>
  ({ companyId } as unknown as Request & { companyId: string });

describe('CustomerController', () => {
  let controller: CustomerController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [{ provide: CustomerService, useValue: mockService }],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    const dto = { companyId: 'co-1', name: 'Jane', address: '123 St' };
    mockService.create.mockResolvedValue({ id: 'cust-1', ...dto });

    const result = await controller.create(dto);
    expect(result.id).toBe('cust-1');
  });

  it('should call findAll with companyId', async () => {
    mockService.findAllByCompany.mockResolvedValue([]);
    const req = makeReq();

    await controller.findAll(req);
    expect(mockService.findAllByCompany).toHaveBeenCalledWith('co-1');
  });

  it('should call findOne with id and companyId', async () => {
    mockService.findOne.mockResolvedValue({ id: 'cust-1' });
    const req = makeReq();

    await controller.findOne('cust-1', req);
    expect(mockService.findOne).toHaveBeenCalledWith('cust-1', 'co-1');
  });

  it('should call update', async () => {
    const dto = { name: 'Updated' };
    mockService.update.mockResolvedValue({ id: 'cust-1', name: 'Updated' });
    const req = makeReq();

    await controller.update('cust-1', dto, req);
    expect(mockService.update).toHaveBeenCalledWith('cust-1', 'co-1', dto);
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: 'cust-1' });
    const req = makeReq();

    await controller.remove('cust-1', req);
    expect(mockService.remove).toHaveBeenCalledWith('cust-1', 'co-1');
  });
});
