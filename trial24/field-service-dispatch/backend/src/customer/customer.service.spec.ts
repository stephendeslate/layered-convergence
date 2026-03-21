import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: {
    customer: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      customer: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  describe('findAll', () => {
    it('should return customers for a company', async () => {
      const mockCustomers = [{ id: '1', name: 'Acme' }];
      prisma.customer.findMany.mockResolvedValue(mockCustomers);

      const result = await service.findAll('c-1');
      expect(result).toEqual(mockCustomers);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id and company', async () => {
      const mockCustomer = { id: '1', name: 'Acme', companyId: 'c-1' };
      prisma.customer.findFirst.mockResolvedValue(mockCustomer);

      const result = await service.findOne('1', 'c-1');
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad', 'c-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const data = { name: 'New Customer', companyId: 'c-1' };
      prisma.customer.create.mockResolvedValue({ id: '1', ...data });

      const result = await service.create(data);
      expect(result.name).toBe('New Customer');
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue({ id: '1', companyId: 'c-1' });
      prisma.customer.delete.mockResolvedValue({ id: '1' });

      await service.remove('1', 'c-1');
      expect(prisma.customer.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
