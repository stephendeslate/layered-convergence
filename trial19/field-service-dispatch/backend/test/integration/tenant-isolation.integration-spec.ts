import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { CustomerService } from '../../src/customer/customer.service';
import { WorkOrderService } from '../../src/work-order/work-order.service';
import { TechnicianService } from '../../src/technician/technician.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PrismaModule } from '../../src/prisma/prisma.module';

describe('Tenant Isolation (Integration)', () => {
  let module: TestingModule;
  let customerService: CustomerService;
  let workOrderService: WorkOrderService;
  let technicianService: TechnicianService;
  let prisma: PrismaService;
  let companyAId: string;
  let companyBId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [CustomerService, WorkOrderService, TechnicianService],
    }).compile();

    customerService = module.get<CustomerService>(CustomerService);
    workOrderService = module.get<WorkOrderService>(WorkOrderService);
    technicianService = module.get<TechnicianService>(TechnicianService);
    prisma = module.get<PrismaService>(PrismaService);

    const companyA = await prisma.company.create({ data: { name: 'Tenant Test Co A' } });
    const companyB = await prisma.company.create({ data: { name: 'Tenant Test Co B' } });
    companyAId = companyA.id;
    companyBId = companyB.id;

    const hashedPassword = await bcrypt.hash('password123', 12);
    await prisma.user.create({
      data: { email: 'tenantA@test.com', password: hashedPassword, role: Role.DISPATCHER, companyId: companyAId },
    });
    await prisma.user.create({
      data: { email: 'tenantB@test.com', password: hashedPassword, role: Role.DISPATCHER, companyId: companyBId },
    });
  });

  afterAll(async () => {
    await prisma.workOrder.deleteMany({ where: { companyId: { in: [companyAId, companyBId] } } });
    await prisma.technician.deleteMany({ where: { companyId: { in: [companyAId, companyBId] } } });
    await prisma.customer.deleteMany({ where: { companyId: { in: [companyAId, companyBId] } } });
    await prisma.user.deleteMany({ where: { companyId: { in: [companyAId, companyBId] } } });
    await prisma.company.deleteMany({ where: { id: { in: [companyAId, companyBId] } } });
    await module.close();
  });

  it('should isolate customers between companies via service layer', async () => {
    await customerService.create(
      { name: 'Customer A', email: 'a@test.com', phone: '555-A', address: '1 A St' },
      companyAId,
    );
    await customerService.create(
      { name: 'Customer B', email: 'b@test.com', phone: '555-B', address: '1 B St' },
      companyBId,
    );

    const companyACustomers = await customerService.findAll(companyAId);
    const companyBCustomers = await customerService.findAll(companyBId);

    expect(companyACustomers).toHaveLength(1);
    expect(companyACustomers[0].name).toBe('Customer A');
    expect(companyBCustomers).toHaveLength(1);
    expect(companyBCustomers[0].name).toBe('Customer B');
  });

  it('should deny cross-company customer access via service layer', async () => {
    const customerA = (await customerService.findAll(companyAId))[0];

    await expect(
      customerService.findById(customerA.id, companyBId),
    ).rejects.toThrow(NotFoundException);
  });

  it('should isolate technicians between companies via service layer', async () => {
    await technicianService.create(
      { name: 'Tech A', email: 'techA@test.com', phone: '555-TA', skills: ['HVAC'] },
      companyAId,
    );
    await technicianService.create(
      { name: 'Tech B', email: 'techB@test.com', phone: '555-TB', skills: ['Plumbing'] },
      companyBId,
    );

    const companyATechs = await technicianService.findAll(companyAId);
    const companyBTechs = await technicianService.findAll(companyBId);

    expect(companyATechs).toHaveLength(1);
    expect(companyATechs[0].name).toBe('Tech A');
    expect(companyBTechs).toHaveLength(1);
    expect(companyBTechs[0].name).toBe('Tech B');
  });

  it('should deny cross-company technician access via service layer', async () => {
    const techA = (await technicianService.findAll(companyAId))[0];

    await expect(
      technicianService.findById(techA.id, companyBId),
    ).rejects.toThrow(NotFoundException);
  });

  it('should isolate work orders between companies via service layer', async () => {
    const customerA = (await customerService.findAll(companyAId))[0];
    const customerB = (await customerService.findAll(companyBId))[0];

    await workOrderService.create(
      { title: 'WO A', description: 'Work for A', customerId: customerA.id },
      companyAId,
    );
    await workOrderService.create(
      { title: 'WO B', description: 'Work for B', customerId: customerB.id },
      companyBId,
    );

    const companyAOrders = await workOrderService.findAll(companyAId);
    const companyBOrders = await workOrderService.findAll(companyBId);

    expect(companyAOrders).toHaveLength(1);
    expect(companyAOrders[0].title).toBe('WO A');
    expect(companyBOrders).toHaveLength(1);
    expect(companyBOrders[0].title).toBe('WO B');
  });

  it('should deny cross-company work order access via service layer', async () => {
    const woA = (await workOrderService.findAll(companyAId))[0];

    await expect(
      workOrderService.findById(woA.id, companyBId),
    ).rejects.toThrow(NotFoundException);
  });
});
