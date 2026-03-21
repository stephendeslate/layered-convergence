import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomerPortalService } from './customer-portal.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomerPortalService', () => {
  let service: CustomerPortalService;
  let prisma: any;

  const COMPANY_ID = 'company-1';

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findFirst: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn(),
      },
      customer: {
        findFirst: vi.fn(),
      },
      magicLink: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerPortalService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CustomerPortalService>(CustomerPortalService);
  });

  describe('generateTrackingToken', () => {
    it('should generate a tracking token for a work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', companyId: COMPANY_ID });
      prisma.workOrder.update.mockResolvedValue({});

      const result = await service.generateTrackingToken(COMPANY_ID, {
        workOrderId: 'wo-1',
      });

      expect(result.token).toBeDefined();
      expect(result.token.length).toBeGreaterThan(0);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(prisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'wo-1' },
          data: expect.objectContaining({
            trackingToken: expect.any(String),
            trackingExpiresAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw NotFoundException for missing work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.generateTrackingToken(COMPANY_ID, { workOrderId: 'missing' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should use custom expiry hours', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({ id: 'wo-1', companyId: COMPANY_ID });
      prisma.workOrder.update.mockResolvedValue({});

      const result = await service.generateTrackingToken(COMPANY_ID, {
        workOrderId: 'wo-1',
        expiryHours: 48,
      });

      // Token should expire ~48 hours from now
      const hoursDiff = (result.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
      expect(hoursDiff).toBeGreaterThan(47);
      expect(hoursDiff).toBeLessThan(49);
    });
  });

  describe('getTrackingData', () => {
    it('should return tracking data for a valid token', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        id: 'wo-1',
        status: 'EN_ROUTE',
        serviceType: 'HVAC_REPAIR',
        address: '123 Main St',
        scheduledStart: new Date(),
        scheduledEnd: new Date(),
        technician: {
          id: 'tech-1',
          currentLatitude: 39.78,
          currentLongitude: -89.65,
          user: { firstName: 'John', lastName: 'Doe' },
        },
        company: { name: 'Cool HVAC', logoUrl: null, phone: '555-0100' },
        statusHistory: [
          { fromStatus: 'ASSIGNED', toStatus: 'EN_ROUTE', createdAt: new Date(), notes: null },
        ],
        routeStops: [
          { estimatedArrival: new Date(), sortOrder: 1 },
        ],
      });

      const result = await service.getTrackingData('valid-token');

      expect(result.workOrderId).toBe('wo-1');
      expect(result.status).toBe('EN_ROUTE');
      expect(result.technicianName).toBe('John Doe');
      expect(result.technicianLatitude).toBe(39.78);
      expect(result.companyName).toBe('Cool HVAC');
      expect(result.estimatedArrival).toBeInstanceOf(Date);
      expect(result.statusHistory).toHaveLength(1);
    });

    it('should throw NotFoundException for expired/invalid token', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.getTrackingData('expired-token'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateMagicLink', () => {
    it('should generate a magic link for a customer', async () => {
      prisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', companyId: COMPANY_ID });
      prisma.magicLink.create.mockResolvedValue({});

      const result = await service.generateMagicLink(COMPANY_ID, {
        customerId: 'cust-1',
      });

      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException for missing customer', async () => {
      prisma.customer.findFirst.mockResolvedValue(null);

      await expect(
        service.generateMagicLink(COMPANY_ID, { customerId: 'missing' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateMagicLink', () => {
    it('should validate and mark magic link as used', async () => {
      const customer = { id: 'cust-1', firstName: 'Jane', lastName: 'Smith' };
      prisma.magicLink.findFirst.mockResolvedValue({
        id: 'ml-1',
        token: 'valid-token',
        customer,
      });
      prisma.magicLink.update.mockResolvedValue({});

      const result = await service.validateMagicLink('valid-token');

      expect(result.id).toBe('cust-1');
      expect(prisma.magicLink.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { usedAt: expect.any(Date) },
        }),
      );
    });

    it('should throw NotFoundException for invalid magic link', async () => {
      prisma.magicLink.findFirst.mockResolvedValue(null);

      await expect(
        service.validateMagicLink('bad-token'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
