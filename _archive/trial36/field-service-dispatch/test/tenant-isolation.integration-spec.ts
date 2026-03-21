import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  getTestPrisma,
  cleanDatabase,
  teardown,
  createTestCompany,
  createTestCustomer,
  createTestTechnician,
  createTestWorkOrder,
} from './helpers';

describe('Tenant Isolation (integration)', () => {
  let prisma: PrismaClient;
  let companyA: string;
  let companyB: string;

  beforeAll(async () => {
    prisma = getTestPrisma();
    await prisma.$connect();
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    await cleanDatabase();
    const a = await createTestCompany(prisma, { name: 'Company A', slug: `company-a-${Date.now()}` });
    const b = await createTestCompany(prisma, { name: 'Company B', slug: `company-b-${Date.now()}` });
    companyA = a.id;
    companyB = b.id;
  });

  it('should isolate customers by company', async () => {
    await createTestCustomer(prisma, companyA, { name: 'Customer A' });
    await createTestCustomer(prisma, companyB, { name: 'Customer B' });

    const customersA = await prisma.customer.findMany({ where: { companyId: companyA } });
    const customersB = await prisma.customer.findMany({ where: { companyId: companyB } });

    expect(customersA).toHaveLength(1);
    expect(customersA[0].name).toBe('Customer A');
    expect(customersB).toHaveLength(1);
    expect(customersB[0].name).toBe('Customer B');
  });

  it('should isolate technicians by company', async () => {
    await createTestTechnician(prisma, companyA, { name: 'Tech A' });
    await createTestTechnician(prisma, companyA, { name: 'Tech A2' });
    await createTestTechnician(prisma, companyB, { name: 'Tech B' });

    const techsA = await prisma.technician.findMany({ where: { companyId: companyA } });
    const techsB = await prisma.technician.findMany({ where: { companyId: companyB } });

    expect(techsA).toHaveLength(2);
    expect(techsB).toHaveLength(1);
  });

  it('should isolate work orders by company', async () => {
    const customerA = await createTestCustomer(prisma, companyA);
    const customerB = await createTestCustomer(prisma, companyB);

    await createTestWorkOrder(prisma, companyA, customerA.id, { title: 'WO for A' });
    await createTestWorkOrder(prisma, companyB, customerB.id, { title: 'WO for B' });

    const woA = await prisma.workOrder.findMany({ where: { companyId: companyA } });
    const woB = await prisma.workOrder.findMany({ where: { companyId: companyB } });

    expect(woA).toHaveLength(1);
    expect(woA[0].title).toBe('WO for A');
    expect(woB).toHaveLength(1);
    expect(woB[0].title).toBe('WO for B');
  });

  it('should not return other company data with findFirst scoped query', async () => {
    const customerA = await createTestCustomer(prisma, companyA, { name: 'Only A Customer' });

    // Try to find company A's customer using company B scope
    const notFound = await prisma.customer.findFirst({
      where: { id: customerA.id, companyId: companyB },
    });

    expect(notFound).toBeNull();

    // But company A scope should work
    const found = await prisma.customer.findFirst({
      where: { id: customerA.id, companyId: companyA },
    });
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Only A Customer');
  });

  it('should isolate users by company', async () => {
    await prisma.user.create({
      data: {
        email: 'admin-a@test.com',
        name: 'Admin A',
        password: '$2b$10$hash',
        companyId: companyA,
        role: 'ADMIN',
      },
    });
    await prisma.user.create({
      data: {
        email: 'admin-b@test.com',
        name: 'Admin B',
        password: '$2b$10$hash',
        companyId: companyB,
        role: 'ADMIN',
      },
    });

    const usersA = await prisma.user.findMany({ where: { companyId: companyA } });
    const usersB = await prisma.user.findMany({ where: { companyId: companyB } });

    expect(usersA).toHaveLength(1);
    expect(usersA[0].email).toBe('admin-a@test.com');
    expect(usersB).toHaveLength(1);
    expect(usersB[0].email).toBe('admin-b@test.com');
  });
});
