import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { WorkOrderService } from '../../src/work-order/work-order.service';
import { TechnicianService } from '../../src/technician/technician.service';
import { CustomerService } from '../../src/customer/customer.service';

describe('Tenant Isolation (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let workOrderService: WorkOrderService;
  let technicianService: TechnicianService;
  let customerService: CustomerService;
  let companyAId: string;
  let companyBId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    workOrderService = app.get(WorkOrderService);
    technicianService = app.get(TechnicianService);
    customerService = app.get(CustomerService);
  });

  afterAll(async () => {
    await prisma.gpsEvent.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.workOrder.deleteMany();
    await prisma.route.deleteMany();
    await prisma.technician.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.invoice.deleteMany();
    await prisma.workOrder.deleteMany();
    await prisma.route.deleteMany();
    await prisma.technician.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();

    const companyA = await prisma.company.create({ data: { name: 'Company A' } });
    companyAId = companyA.id;

    const companyB = await prisma.company.create({ data: { name: 'Company B' } });
    companyBId = companyB.id;
  });

  it('should not allow Company A to see Company B work orders', async () => {
    await workOrderService.create(companyAId, { title: 'Company A WO' });
    await workOrderService.create(companyBId, { title: 'Company B WO' });

    const companyAOrders = await workOrderService.findAll(companyAId);
    const companyBOrders = await workOrderService.findAll(companyBId);

    expect(companyAOrders).toHaveLength(1);
    expect(companyAOrders[0].title).toBe('Company A WO');
    expect(companyBOrders).toHaveLength(1);
    expect(companyBOrders[0].title).toBe('Company B WO');
  });

  it('should not allow Company A to access Company B work order by ID', async () => {
    const woBId = await workOrderService.create(companyBId, { title: 'Company B WO' });

    await expect(
      workOrderService.findOne(companyAId, woBId.id),
    ).rejects.toThrow('Work order not found');
  });

  it('should isolate technicians by company', async () => {
    await technicianService.create(companyAId, {
      email: 'tech@a.com',
      name: 'Tech A',
    });
    await technicianService.create(companyBId, {
      email: 'tech@b.com',
      name: 'Tech B',
    });

    const techsA = await technicianService.findAll(companyAId);
    const techsB = await technicianService.findAll(companyBId);

    expect(techsA).toHaveLength(1);
    expect(techsA[0].name).toBe('Tech A');
    expect(techsB).toHaveLength(1);
    expect(techsB[0].name).toBe('Tech B');
  });

  it('should not allow Company A to access Company B technician by ID', async () => {
    const techB = await technicianService.create(companyBId, {
      email: 'tech@b.com',
      name: 'Tech B',
    });

    await expect(
      technicianService.findOne(companyAId, techB.id),
    ).rejects.toThrow('Technician not found');
  });

  it('should isolate customers by company', async () => {
    await customerService.create(companyAId, {
      name: 'Customer A',
      address: '123 A St',
    });
    await customerService.create(companyBId, {
      name: 'Customer B',
      address: '456 B St',
    });

    const custsA = await customerService.findAll(companyAId);
    const custsB = await customerService.findAll(companyBId);

    expect(custsA).toHaveLength(1);
    expect(custsA[0].name).toBe('Customer A');
    expect(custsB).toHaveLength(1);
    expect(custsB[0].name).toBe('Customer B');
  });

  it('should not allow cross-tenant work order transitions', async () => {
    const woA = await workOrderService.create(companyAId, { title: 'Company A WO' });

    await expect(
      workOrderService.transition(companyBId, woA.id, 'ASSIGNED'),
    ).rejects.toThrow('Work order not found');
  });
});
