import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderService } from '../../work-order/work-order.service';
import { TechnicianService } from '../../technician/technician.service';
import { CustomerService } from '../../customer/customer.service';
import { CompanyService } from '../../company/company.service';
import { InvoiceService } from '../../invoice/invoice.service';
import { RouteService } from '../../route/route.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Error Handling (Integration)', () => {
  let prisma: PrismaService;
  let companyService: CompanyService;
  let technicianService: TechnicianService;
  let customerService: CustomerService;
  let workOrderService: WorkOrderService;
  let invoiceService: InvoiceService;
  let routeService: RouteService;
  let companyId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        CompanyService,
        TechnicianService,
        CustomerService,
        WorkOrderService,
        InvoiceService,
        RouteService,
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    companyService = module.get<CompanyService>(CompanyService);
    technicianService = module.get<TechnicianService>(TechnicianService);
    customerService = module.get<CustomerService>(CustomerService);
    workOrderService = module.get<WorkOrderService>(WorkOrderService);
    invoiceService = module.get<InvoiceService>(InvoiceService);
    routeService = module.get<RouteService>(RouteService);

    await prisma.cleanDatabase();

    const company = await prisma.company.create({ data: { name: 'Error Test Corp' } });
    companyId = company.id;
  });

  describe('NotFoundException scenarios', () => {
    it('should throw NotFoundException for nonexistent company', async () => {
      await expect(companyService.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for nonexistent technician', async () => {
      await expect(
        technicianService.findOne('nonexistent', companyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for nonexistent customer', async () => {
      await expect(
        customerService.findOne('nonexistent', companyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for nonexistent work order', async () => {
      await expect(
        workOrderService.findOne('nonexistent', companyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for nonexistent invoice', async () => {
      await expect(
        invoiceService.findOne('nonexistent', companyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for nonexistent route', async () => {
      await expect(
        routeService.findOne('nonexistent', companyId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when updating nonexistent company', async () => {
      await expect(
        companyService.update('nonexistent', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when deleting nonexistent technician', async () => {
      await expect(
        technicianService.remove('nonexistent', companyId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('BadRequestException scenarios', () => {
    it('should throw BadRequestException for invalid work order transition', async () => {
      const customer = await prisma.customer.create({
        data: {
          name: 'Cust',
          email: 'c@test.com',
          lat: 40.7,
          lng: -74.0,
          address: '123 St',
          companyId,
        },
      });

      const wo = await workOrderService.create(companyId, {
        title: 'Test',
        customerId: customer.id,
      });

      await expect(
        workOrderService.transition(wo.id, companyId, 'COMPLETED' as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when invoicing non-completed work order', async () => {
      const customer = await prisma.customer.create({
        data: {
          name: 'Cust2',
          email: 'c2@test.com',
          lat: 40.7,
          lng: -74.0,
          address: '456 St',
          companyId,
        },
      });

      const wo = await workOrderService.create(companyId, {
        title: 'Invoice Test',
        customerId: customer.id,
      });

      await expect(
        invoiceService.create(companyId, { amount: 100, workOrderId: wo.id }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no available technicians for auto-assign', async () => {
      const customer = await prisma.customer.create({
        data: {
          name: 'Cust3',
          email: 'c3@test.com',
          lat: 40.7,
          lng: -74.0,
          address: '789 St',
          companyId,
        },
      });

      const wo = await workOrderService.create(companyId, {
        title: 'Auto-assign Test',
        customerId: customer.id,
      });

      await expect(
        routeService.autoAssignNearest(wo.id, companyId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Cascading operations', () => {
    it('should handle deleting company with related data', async () => {
      const tempCompany = await prisma.company.create({ data: { name: 'Temp' } });

      await prisma.customer.create({
        data: {
          name: 'Temp Customer',
          email: 'temp@test.com',
          lat: 40.7,
          lng: -74.0,
          address: '0 St',
          companyId: tempCompany.id,
        },
      });

      await prisma.technician.create({
        data: {
          name: 'Temp Tech',
          email: 'temptech@test.com',
          lat: 40.7,
          lng: -74.0,
          skills: ['test'],
          companyId: tempCompany.id,
        },
      });

      await companyService.remove(tempCompany.id);

      // After deleting company, related records should be gone
      const customers = await prisma.customer.findMany({ where: { companyId: tempCompany.id } });
      const technicians = await prisma.technician.findMany({ where: { companyId: tempCompany.id } });

      expect(customers).toHaveLength(0);
      expect(technicians).toHaveLength(0);
    });
  });
});
