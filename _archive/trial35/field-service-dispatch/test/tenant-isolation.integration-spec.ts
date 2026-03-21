import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  getTestPrisma,
  cleanDatabase,
  teardown,
  createTestCompany,
  createTestCustomer,
  createTestTechnician,
} from './helpers';

describe('Tenant Isolation (Integration)', () => {
  let prisma: PrismaClient;
  let companyA: { id: string };
  let companyB: { id: string };

  beforeAll(async () => {
    prisma = await getTestPrisma();
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    await cleanDatabase();
    companyA = await createTestCompany(prisma, { name: 'Company A', slug: 'company-a' });
    companyB = await createTestCompany(prisma, { name: 'Company B', slug: 'company-b' });
  });

  it('should isolate customers by company', async () => {
    await createTestCustomer(prisma, companyA.id, { name: 'Alice' });
    await createTestCustomer(prisma, companyB.id, { name: 'Bob' });

    const customersA = await prisma.customer.findMany({ where: { companyId: companyA.id } });
    const customersB = await prisma.customer.findMany({ where: { companyId: companyB.id } });

    expect(customersA).toHaveLength(1);
    expect(customersA[0].name).toBe('Alice');
    expect(customersB).toHaveLength(1);
    expect(customersB[0].name).toBe('Bob');
  });

  it('should isolate technicians by company', async () => {
    await createTestTechnician(prisma, companyA.id, { name: 'Tech A' });
    await createTestTechnician(prisma, companyA.id, { name: 'Tech A2' });
    await createTestTechnician(prisma, companyB.id, { name: 'Tech B' });

    const techsA = await prisma.technician.findMany({ where: { companyId: companyA.id } });
    const techsB = await prisma.technician.findMany({ where: { companyId: companyB.id } });

    expect(techsA).toHaveLength(2);
    expect(techsB).toHaveLength(1);
  });

  it('should isolate work orders by company', async () => {
    const customerA = await createTestCustomer(prisma, companyA.id);
    const customerB = await createTestCustomer(prisma, companyB.id);

    await prisma.workOrder.create({
      data: { title: 'Fix AC', companyId: companyA.id, customerId: customerA.id },
    });
    await prisma.workOrder.create({
      data: { title: 'Fix Heater', companyId: companyB.id, customerId: customerB.id },
    });

    const ordersA = await prisma.workOrder.findMany({ where: { companyId: companyA.id } });
    const ordersB = await prisma.workOrder.findMany({ where: { companyId: companyB.id } });

    expect(ordersA).toHaveLength(1);
    expect(ordersA[0].title).toBe('Fix AC');
    expect(ordersB).toHaveLength(1);
    expect(ordersB[0].title).toBe('Fix Heater');
  });

  it('should not allow cross-company findFirst', async () => {
    const customerA = await createTestCustomer(prisma, companyA.id, { name: 'Only A' });

    const crossCompany = await prisma.customer.findFirst({
      where: { id: customerA.id, companyId: companyB.id },
    });

    expect(crossCompany).toBeNull();
  });

  it('should enforce company slug uniqueness', async () => {
    await expect(
      createTestCompany(prisma, { name: 'Duplicate', slug: 'company-a' }),
    ).rejects.toThrow();
  });

  it('should set company context via set_config', async () => {
    await prisma.$executeRaw`SELECT set_config('app.company_id', ${companyA.id}, true)`;
    const result = await prisma.$queryRaw<[{ current_setting: string }]>`SELECT current_setting('app.company_id', true)`;
    expect(result[0].current_setting).toBe(companyA.id);
  });
});
