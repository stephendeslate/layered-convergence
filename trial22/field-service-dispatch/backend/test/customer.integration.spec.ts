// Integration tests for CustomerService — REAL database, NO Prisma mocking

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomerModule } from '../src/customer/customer.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CustomerService } from '../src/customer/customer.service';

describe('CustomerService Integration', () => {
  let module: TestingModule;
  let customerService: CustomerService;
  let prisma: PrismaService;
  let companyId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [CustomerModule, PrismaModule],
    }).compile();

    customerService = module.get<CustomerService>(CustomerService);
    prisma = module.get<PrismaService>(PrismaService);

    const company = await prisma.company.create({
      data: { name: 'Customer Test Company' },
    });
    companyId = company.id;
  });

  afterAll(async () => {
    await prisma.customer.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { id: companyId } });
    await module.close();
  });

  it('should create a customer', async () => {
    const customer = await customerService.create(
      {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '555-0100',
        address: '100 Main St',
      },
      companyId,
    );

    expect(customer).toBeDefined();
    expect(customer.name).toBe('John Smith');
    expect(customer.email).toBe('john@example.com');
    expect(customer.companyId).toBe(companyId);
  });

  it('should list customers for a company', async () => {
    const customers = await customerService.findAll(companyId);

    expect(customers.length).toBeGreaterThanOrEqual(1);
    for (const c of customers) {
      expect(c.companyId).toBe(companyId);
    }
  });

  it('should find a customer by ID', async () => {
    const created = await customerService.create(
      {
        name: 'Jane Doe',
        address: '200 Oak Ave',
      },
      companyId,
    );

    const found = await customerService.findOne(created.id, companyId);
    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Jane Doe');
  });

  it('should throw NotFoundException for non-existent customer', async () => {
    await expect(
      customerService.findOne('00000000-0000-0000-0000-000000000000', companyId),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update a customer', async () => {
    const created = await customerService.create(
      {
        name: 'Original Name',
        address: '300 Pine Rd',
      },
      companyId,
    );

    const updated = await customerService.update(
      created.id,
      { name: 'Updated Name', phone: '555-0200' },
      companyId,
    );

    expect(updated.name).toBe('Updated Name');
    expect(updated.phone).toBe('555-0200');
  });

  it('should not find a customer from a different company', async () => {
    const otherCompany = await prisma.company.create({
      data: { name: 'Other Customer Co' },
    });

    const otherCustomer = await prisma.customer.create({
      data: {
        name: 'Other Customer',
        address: '999 Other St',
        companyId: otherCompany.id,
      },
    });

    await expect(
      customerService.findOne(otherCustomer.id, companyId),
    ).rejects.toThrow(NotFoundException);

    // Cleanup
    await prisma.customer.deleteMany({ where: { companyId: otherCompany.id } });
    await prisma.company.delete({ where: { id: otherCompany.id } });
  });
});
