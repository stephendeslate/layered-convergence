import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LineItemService } from './line-item.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('LineItemService', () => {
  let service: LineItemService;
  let prisma: any;
  let audit: any;

  const COMPANY_ID = 'company-1';
  const WO_ID = 'wo-1';

  function makeLineItem(overrides: Record<string, any> = {}) {
    return {
      id: 'li-1',
      companyId: COMPANY_ID,
      workOrderId: WO_ID,
      invoiceId: null,
      type: 'LABOR',
      description: 'Repair work',
      quantity: 2,
      unitPrice: 75.00,
      totalPrice: 150.00,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findFirst: vi.fn(),
      },
      lineItem: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    audit = {
      log: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineItemService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<LineItemService>(LineItemService);
  });

  describe('create', () => {
    it('should create a labor line item', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: WO_ID, companyId: COMPANY_ID, invoice: null });
      const item = makeLineItem();
      prisma.lineItem.create.mockResolvedValue(item);

      const result = await service.create(COMPANY_ID, {
        workOrderId: WO_ID,
        type: 'LABOR',
        description: 'Repair work',
        quantity: 2,
        unitPrice: 75.00,
      }, 'user-1');

      expect(result.id).toBe('li-1');
      expect(prisma.lineItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalPrice: 150.00,
          }),
        }),
      );
    });

    it('should calculate discount as negative', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: WO_ID, companyId: COMPANY_ID, invoice: null });
      prisma.lineItem.create.mockResolvedValue(makeLineItem({ type: 'DISCOUNT', totalPrice: -50.00 }));

      await service.create(COMPANY_ID, {
        workOrderId: WO_ID,
        type: 'DISCOUNT',
        description: '10% off',
        quantity: 1,
        unitPrice: 50.00,
      }, 'user-1');

      expect(prisma.lineItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalPrice: -50.00,
          }),
        }),
      );
    });

    it('should throw NotFoundException for missing work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.create(COMPANY_ID, {
          workOrderId: 'missing',
          type: 'LABOR',
          description: 'Work',
          quantity: 1,
          unitPrice: 100,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if invoice is already sent', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: WO_ID,
        companyId: COMPANY_ID,
        invoice: { id: 'inv-1', status: 'SENT' },
      });

      await expect(
        service.create(COMPANY_ID, {
          workOrderId: WO_ID,
          type: 'LABOR',
          description: 'Work',
          quantity: 1,
          unitPrice: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update and recalculate total', async () => {
      prisma.lineItem.findFirst.mockResolvedValue(makeLineItem());
      prisma.lineItem.update.mockResolvedValue(makeLineItem({ quantity: 3, totalPrice: 225 }));

      await service.update(COMPANY_ID, 'li-1', { quantity: 3 }, 'user-1');

      expect(prisma.lineItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            quantity: 3,
            totalPrice: 225,
          }),
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete a line item', async () => {
      prisma.lineItem.findFirst.mockResolvedValue(makeLineItem());
      prisma.lineItem.delete.mockResolvedValue({});

      await service.delete(COMPANY_ID, 'li-1', 'user-1');

      expect(prisma.lineItem.delete).toHaveBeenCalledWith({ where: { id: 'li-1' } });
      expect(audit.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException for missing item', async () => {
      prisma.lineItem.findFirst.mockResolvedValue(null);

      await expect(service.delete(COMPANY_ID, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateTotals', () => {
    it('should calculate work order totals', async () => {
      prisma.lineItem.findMany.mockResolvedValue([
        makeLineItem({ type: 'LABOR', totalPrice: 150.00 }),
        makeLineItem({ id: 'li-2', type: 'MATERIAL', totalPrice: 50.00 }),
        makeLineItem({ id: 'li-3', type: 'DISCOUNT', totalPrice: -20.00 }),
        makeLineItem({ id: 'li-4', type: 'TAX', totalPrice: 14.40 }),
      ]);

      const result = await service.calculateTotals(COMPANY_ID, WO_ID);

      expect(result.subtotal).toBe(200.00); // 150 + 50
      expect(result.discounts).toBe(20.00);
      expect(result.taxAmount).toBe(14.40);
      expect(result.total).toBe(194.40); // 200 - 20 + 14.40
      expect(result.lineItems).toHaveLength(4);
    });

    it('should return zero totals for empty work order', async () => {
      prisma.lineItem.findMany.mockResolvedValue([]);

      const result = await service.calculateTotals(COMPANY_ID, WO_ID);

      expect(result.subtotal).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple line items', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: WO_ID, companyId: COMPANY_ID });
      prisma.lineItem.create
        .mockResolvedValueOnce(makeLineItem({ id: 'li-1' }))
        .mockResolvedValueOnce(makeLineItem({ id: 'li-2', type: 'MATERIAL' }));

      const result = await service.bulkCreate(COMPANY_ID, WO_ID, [
        { type: 'LABOR', description: 'Labor', quantity: 1, unitPrice: 100 },
        { type: 'MATERIAL', description: 'Parts', quantity: 2, unitPrice: 25 },
      ], 'user-1');

      expect(result).toHaveLength(2);
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'line_item.bulk_create',
          metadata: { count: 2 },
        }),
      );
    });
  });
});
