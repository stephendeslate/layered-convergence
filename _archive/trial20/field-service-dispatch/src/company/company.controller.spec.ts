import { CompanyController } from './company.controller.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('CompanyController', () => {
  let controller: CompanyController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new CompanyController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    const dto = { name: 'ACME' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });

    const result = await controller.create(dto);

    expect(result).toEqual({ id: '1', ...dto });
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue([]);

    expect(await controller.findAll()).toEqual([]);
  });

  it('should call findOne', async () => {
    const company = { id: '1', name: 'ACME' };
    mockService.findOne.mockResolvedValue(company);

    expect(await controller.findOne('1')).toEqual(company);
  });

  it('should call update', async () => {
    const updated = { id: '1', name: 'Updated' };
    mockService.update.mockResolvedValue(updated);

    expect(await controller.update('1', { name: 'Updated' })).toEqual(updated);
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });

    expect(await controller.remove('1')).toEqual({ id: '1' });
  });
});
