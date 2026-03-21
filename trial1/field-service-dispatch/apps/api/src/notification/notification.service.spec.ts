import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: any;
  let smsService: any;

  const COMPANY_ID = 'company-1';

  function makeNotification(overrides: Record<string, any> = {}) {
    return {
      id: 'notif-1',
      companyId: COMPANY_ID,
      workOrderId: 'wo-1',
      recipientType: 'CUSTOMER',
      recipientId: 'cust-1',
      channel: 'EMAIL',
      type: 'JOB_COMPLETED',
      subject: 'Job Completed',
      body: 'Your job has been completed.',
      sentAt: new Date(),
      failedAt: null,
      failureReason: null,
      externalId: 'mock-email-123',
      createdAt: new Date(),
      ...overrides,
    };
  }

  beforeEach(async () => {
    prisma = {
      notification: {
        create: vi.fn(),
        update: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn().mockResolvedValue(1),
      },
      workOrder: {
        findFirst: vi.fn(),
      },
    };

    smsService = {
      send: vi.fn().mockResolvedValue({ success: true, externalId: 'mock-sms-123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: SmsService, useValue: smsService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe('send', () => {
    it('should create and send an email notification', async () => {
      const notif = makeNotification();
      prisma.notification.create.mockResolvedValue(notif);
      prisma.notification.update.mockResolvedValue(notif);
      prisma.notification.findUnique.mockResolvedValue(notif);

      const result = await service.send(COMPANY_ID, {
        workOrderId: 'wo-1',
        recipientType: 'CUSTOMER',
        recipientId: 'cust-1',
        channel: 'EMAIL',
        type: 'JOB_COMPLETED',
        subject: 'Job Completed',
        body: 'Your job has been completed.',
        recipientContact: 'test@example.com',
      });

      expect(prisma.notification.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result!.id).toBe('notif-1');
    });

    it('should create and send an SMS notification', async () => {
      const notif = makeNotification({ channel: 'SMS' });
      prisma.notification.create.mockResolvedValue(notif);
      prisma.notification.update.mockResolvedValue(notif);
      prisma.notification.findUnique.mockResolvedValue(notif);

      await service.send(COMPANY_ID, {
        workOrderId: 'wo-1',
        recipientType: 'CUSTOMER',
        recipientId: 'cust-1',
        channel: 'SMS',
        type: 'ARRIVING_SOON_15',
        body: 'Technician arriving in 15 min',
        recipientContact: '+15551234567',
      });

      expect(smsService.send).toHaveBeenCalledWith({
        to: '+15551234567',
        body: 'Technician arriving in 15 min',
      });
    });
  });

  describe('get', () => {
    it('should return a notification by id', async () => {
      const notif = makeNotification();
      prisma.notification.findFirst.mockResolvedValue(notif);

      const result = await service.get(COMPANY_ID, 'notif-1');
      expect(result.id).toBe('notif-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.notification.findFirst.mockResolvedValue(null);

      await expect(service.get(COMPANY_ID, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('list', () => {
    it('should return paginated notifications', async () => {
      const notif = makeNotification();
      prisma.notification.findMany.mockResolvedValue([notif]);
      prisma.notification.count.mockResolvedValue(1);

      const result = await service.list(COMPANY_ID, { page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by channel', async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      await service.list(COMPANY_ID, { channel: 'SMS' });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ channel: 'SMS' }),
        }),
      );
    });
  });

  describe('sendWorkOrderNotification', () => {
    it('should throw NotFoundException for missing work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.sendWorkOrderNotification(
          COMPANY_ID,
          'missing-wo',
          'JOB_COMPLETED',
          'CUSTOMER',
          'cust-1',
          'test@example.com',
          'EMAIL',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should send notification for a valid work order', async () => {
      const workOrder = {
        id: 'wo-1',
        companyId: COMPANY_ID,
        serviceType: 'HVAC_REPAIR',
        address: '123 Main St',
        scheduledStart: new Date(),
        technician: {
          user: { firstName: 'John', lastName: 'Doe' },
        },
        customer: { firstName: 'Jane', lastName: 'Smith' },
        company: { name: 'Cool HVAC Co' },
      };
      prisma.workOrder.findFirst.mockResolvedValue(workOrder);

      const notif = makeNotification();
      prisma.notification.create.mockResolvedValue(notif);
      prisma.notification.update.mockResolvedValue(notif);
      prisma.notification.findUnique.mockResolvedValue(notif);

      const result = await service.sendWorkOrderNotification(
        COMPANY_ID,
        'wo-1',
        'JOB_COMPLETED',
        'CUSTOMER',
        'cust-1',
        'jane@example.com',
        'EMAIL',
      );

      expect(prisma.notification.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
