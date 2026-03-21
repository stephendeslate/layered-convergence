import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('Tenant Isolation (Integration)', () => {
  let prisma: PrismaClient;
  let companyAId: string;
  let companyBId: string;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: { db: { url: process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL } },
    });
    await prisma.$connect();

    const companyA = await prisma.company.create({ data: { name: 'Company A' } });
    const companyB = await prisma.company.create({ data: { name: 'Company B' } });
    companyAId = companyA.id;
    companyBId = companyB.id;

    const hashedPassword = await bcrypt.hash('password123', 12);

    await prisma.user.create({
      data: { email: 'userA@test.com', password: hashedPassword, role: Role.DISPATCHER, companyId: companyAId },
    });
    await prisma.user.create({
      data: { email: 'userB@test.com', password: hashedPassword, role: Role.DISPATCHER, companyId: companyBId },
    });
  });

  afterAll(async () => {
    await prisma.customer.deleteMany({ where: { companyId: { in: [companyAId, companyBId] } } });
    await prisma.user.deleteMany({ where: { companyId: { in: [companyAId, companyBId] } } });
    await prisma.company.deleteMany({ where: { id: { in: [companyAId, companyBId] } } });
    await prisma.$disconnect();
  });

  it('should isolate customers between companies', async () => {
    await prisma.customer.create({
      data: { name: 'Customer A', email: 'a@test.com', phone: '555-A', address: '1 A St', companyId: companyAId },
    });
    await prisma.customer.create({
      data: { name: 'Customer B', email: 'b@test.com', phone: '555-B', address: '1 B St', companyId: companyBId },
    });

    const companyACustomers = await prisma.customer.findMany({ where: { companyId: companyAId } });
    const companyBCustomers = await prisma.customer.findMany({ where: { companyId: companyBId } });

    expect(companyACustomers).toHaveLength(1);
    expect(companyACustomers[0].name).toBe('Customer A');

    expect(companyBCustomers).toHaveLength(1);
    expect(companyBCustomers[0].name).toBe('Customer B');
  });

  it('should not allow cross-tenant access via findFirst', async () => {
    const customerA = await prisma.customer.findFirst({
      where: { companyId: companyAId },
    });

    // findFirst justified: simulating tenant-scoped lookup by id + companyId
    const crossTenantResult = await prisma.customer.findFirst({
      where: { id: customerA!.id, companyId: companyBId },
    });

    expect(crossTenantResult).toBeNull();
  });
});
