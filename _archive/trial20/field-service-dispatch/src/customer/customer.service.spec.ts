import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service.js';

const mockPrisma = {
  customer: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CustomerService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const dto = { companyId: 'c1', name: 'Jane', address: '123 Main' };
      const result = { id: 'cu1', ...dto };
      mockPrisma.customer.create.mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
    });
  });

  describe('findAllByCompany', () => {
    it('should return customers for a company', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([]);

      expect(await service.findAllByCompany('c1')).toEqual([]);
      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a customer scoped by company', async () => {
      const customer = { id: 'cu1', companyId: 'c1' };
      mockPrisma.customer.findFirst.mockResolvedValue(customer);

      expect(await service.findOne('cu1', 'c1')).toEqual(customer);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.findOne('cu1', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cu1' });
      mockPrisma.customer.update.mockResolvedValue({ id: 'cu1', name: 'Updated' });

      expect(await service.update('cu1', 'c1', { name: 'Updated' })).toEqual({
        id: 'cu1',
        name: 'Updated',
      });
    });

    it('should throw NotFoundException on update if not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.update('cu1', 'c1', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cu1' });
      mockPrisma.customer.delete.mockResolvedValue({ id: 'cu1' });

      expect(await service.remove('cu1', 'c1')).toEqual({ id: 'cu1' });
    });

    it('should throw NotFoundException on remove if not found', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.remove('cu1', 'c1')).rejects.toThrow(NotFoundException);
    });
  });
});
