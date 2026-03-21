// Integration tests for InvoiceService — REAL database, NO Prisma mocking

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { InvoiceModule } from '../src/invoice/invoice.module';
import { WorkOrderModule } from '../src/work-order/work-order.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { InvoiceService } from '../src/invoice/invoice.service';
import { WorkOrderService } from '../src/work-order/work-order.service';

describe('InvoiceService Integration', () => {
  let module: TestingModule;
  let invoiceService: InvoiceService;
  let workOrderService: WorkOrderService;
  let prisma: PrismaService;
  let companyId: string;
  let customerId: string;
  let technicianId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [InvoiceModule, WorkOrderModule, PrismaModule],
    }).compile();

    invoiceService = module.get<InvoiceService>(InvoiceService);
    workOrderService = module.get<WorkOrderService>(WorkOrderService);
    prisma = module.get<PrismaService>(PrismaService);

    // Create real test data
    const company = await prisma.company.create({
      data: { name: 'Invoice Test Company' },
    });
    companyId = company.id;

    const customer = await prisma.customer.create({
      data: {
        name: 'Invoice Test Customer',
        address: '789 Invoice St',
        companyId,
      },
    });
    customerId = customer.id;

    const user = await prisma.user.create({
      data: {
        email: `inv-test-${Date.now()}@test.com`,
        passwordHash: 'hashed',
        role: 'TECHNICIAN',
        companyId,
      },
    });

    const technician = await prisma.technician.create({
      data: {
        name: 'Invoice Test Tech',
        userId: user.id,
        companyId,
      },
    });
    technicianId = technician.id;
  });

  afterAll(async () => {
    await prisma.invoice.deleteMany({ where: { companyId } });
    await prisma.workOrder.deleteMany({ where: { companyId } });
    await prisma.technician.deleteMany({ where: { companyId } });
    await prisma.customer.deleteMany({ where: { companyId } });
    await prisma.user.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { id: companyId } });
    await module.close();
  });

  async function createCompletedWorkOrder(): Promise<string> {
    const wo = await workOrderService.create(
      {
        title: `Invoice WO ${Date.now()}`,
        priority: 'MEDIUM',
        customerId,
      },
      companyId,
    );

    await workOrderService.assign(wo.id, { technicianId }, companyId);
    await workOrderService.updateStatus(wo.id, { status: 'IN_PROGRESS' }, companyId);
    await workOrderService.updateStatus(wo.id, { status: 'COMPLETED' }, companyId);

    return wo.id;
  }

  it('should create an invoice for a COMPLETED work order', async () => {
    const workOrderId = await createCompletedWorkOrder();

    const invoice = await invoiceService.create(
      {
        workOrderId,
        amount: 250.5,
        taxAmount: 25.05,
      },
      companyId,
    );

    expect(invoice).toBeDefined();
    expect(invoice.invoiceNumber).toMatch(/^INV-/);
    expect(Number(invoice.amount)).toBeCloseTo(250.5, 2);
    expect(Number(invoice.taxAmount)).toBeCloseTo(25.05, 2);
    expect(Number(invoice.totalAmount)).toBeCloseTo(275.55, 2);
    expect(invoice.workOrderId).toBe(workOrderId);
  });

  it('should reject invoice for non-COMPLETED work order', async () => {
    const wo = await workOrderService.create(
      {
        title: 'Not Completed WO',
        priority: 'LOW',
        customerId,
      },
      companyId,
    );

    await expect(
      invoiceService.create(
        {
          workOrderId: wo.id,
          amount: 100,
          taxAmount: 10,
        },
        companyId,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should transition work order to INVOICED after invoice creation', async () => {
    const workOrderId = await createCompletedWorkOrder();

    await invoiceService.create(
      {
        workOrderId,
        amount: 300,
        taxAmount: 30,
      },
      companyId,
    );

    const updatedWo = await workOrderService.findOne(workOrderId, companyId);
    expect(updatedWo.status).toBe('INVOICED');
  });

  it('should list invoices for a company', async () => {
    const invoices = await invoiceService.findAll(companyId);

    expect(invoices.length).toBeGreaterThanOrEqual(1);
    for (const inv of invoices) {
      expect(inv.companyId).toBe(companyId);
      expect(inv.workOrder).toBeDefined();
    }
  });

  it('should find an invoice by ID', async () => {
    const workOrderId = await createCompletedWorkOrder();

    const created = await invoiceService.create(
      {
        workOrderId,
        amount: 500,
        taxAmount: 50,
      },
      companyId,
    );

    const found = await invoiceService.findOne(created.id, companyId);
    expect(found.id).toBe(created.id);
    expect(found.invoiceNumber).toBe(created.invoiceNumber);
  });
});
