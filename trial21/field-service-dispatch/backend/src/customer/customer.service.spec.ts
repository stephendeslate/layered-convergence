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
    companyContext = { setCompanyContext: jest.fn().mockResolvedValue(undefined) };

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

  it('should find all customers for a company', async () => {
    prisma.customer.findMany.mockResolvedValue([{ id: '1', name: 'Test' }]);
    const result = await service.findAll('c1');
    expect(companyContext.setCompanyContext).toHaveBeenCalledWith('c1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException when customer not found', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', 'c1')).rejects.toThrow(NotFoundException);
  });

  it('should create a customer', async () => {
    prisma.customer.create.mockResolvedValue({ id: '1', name: 'New Customer' });
    const result = await service.create(
      { name: 'New Customer', email: 'cust@test.com', phone: '555-0100', address: '123 Main St' },
      'c1',
    );
    expect(result.name).toBe('New Customer');
  });
});
