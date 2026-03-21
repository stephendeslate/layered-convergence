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
    it('should return all customers for company', async () => {
      const customers = [{ id: '1', name: 'Acme', companyId: 'c1' }];
      prisma.customer.findMany.mockResolvedValue(customers);

      const result = await service.findAll('c1');
      expect(result).toEqual(customers);
    });
  });

  describe('findOne', () => {
    it('should return a customer', async () => {
      const customer = { id: '1', name: 'Acme', companyId: 'c1' };
      prisma.customer.findFirst.mockResolvedValue(customer);

      const result = await service.findOne('1', 'c1');
      expect(result).toEqual(customer);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const data = { name: 'Acme', email: 'acme@test.com', companyId: 'c1' };
      prisma.customer.create.mockResolvedValue({ id: '1', ...data });

      const result = await service.create(data);
      expect(result.name).toBe('Acme');
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue({ id: '1', name: 'Acme', companyId: 'c1' });
      prisma.customer.update.mockResolvedValue({ id: '1', name: 'Acme Corp', companyId: 'c1' });

      const result = await service.update('1', 'c1', { name: 'Acme Corp' });
      expect(result.name).toBe('Acme Corp');
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue({ id: '1', name: 'Acme', companyId: 'c1' });
      prisma.customer.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', 'c1');
      expect(result).toEqual({ id: '1' });
    });
  });
});
