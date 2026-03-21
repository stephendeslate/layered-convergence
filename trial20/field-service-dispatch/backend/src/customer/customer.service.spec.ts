import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyContextService } from '../company-context/company-context.service';

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
  let companyContext: { setCompanyContext: jest.Mock };

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
    companyContext = { setCompanyContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: PrismaService, useValue: prisma },
        { provide: CompanyContextService, useValue: companyContext },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all customers for company', async () => {
      const customers = [{ id: '1', name: 'Customer 1', companyId: 'c1' }];
      prisma.customer.findMany.mockResolvedValue(customers);

      const result = await service.findAll('c1');
      expect(result).toEqual(customers);
      expect(companyContext.setCompanyContext).toHaveBeenCalledWith('c1');
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      const customer = { id: '1', name: 'Customer 1', companyId: 'c1' };
      prisma.customer.findFirst.mockResolvedValue(customer);

      const result = await service.findOne('1', 'c1');
      expect(result).toEqual(customer);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const dto = { name: 'New', email: 'new@test.com', phone: '555-1234', address: '123 St' };
      prisma.customer.create.mockResolvedValue({ id: '1', ...dto, companyId: 'c1' });

      const result = await service.create(dto, 'c1');
      expect(result.name).toBe('New');
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue({ id: '1', companyId: 'c1' });
      prisma.customer.delete.mockResolvedValue({ id: '1' });

      await service.remove('1', 'c1');
      expect(prisma.customer.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
