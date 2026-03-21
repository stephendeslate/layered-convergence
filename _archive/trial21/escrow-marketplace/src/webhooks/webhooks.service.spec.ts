import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      webhookLog: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  describe('processEvent', () => {
    it('should process new webhook event', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'w1', eventType: 'payment_intent.succeeded' });

      const result = await service.processEvent({
        eventType: 'payment_intent.succeeded',
        payload: { id: 'pi_123' },
        idempotencyKey: 'evt_123',
      });

      expect(result.eventType).toBe('payment_intent.succeeded');
    });

    it('should throw ConflictException for duplicate event', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.processEvent({
          eventType: 'payment_intent.succeeded',
          payload: { id: 'pi_123' },
          idempotencyKey: 'evt_123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should pass tenantId if provided', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'w1', tenantId: 't1' });

      await service.processEvent(
        {
          eventType: 'transfer.created',
          payload: {},
          idempotencyKey: 'evt_456',
        },
        't1',
      );

      expect(prisma.webhookLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId: 't1' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all webhook logs', async () => {
      prisma.webhookLog.findMany.mockResolvedValue([{ id: 'w1' }]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
    });

    it('should filter by tenantId', async () => {
      prisma.webhookLog.findMany.mockResolvedValue([]);

      await service.findAll('t1');

      expect(prisma.webhookLog.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return webhook log by id', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue({ id: 'w1' });

      const result = await service.findOne('w1');

      expect(result.id).toBe('w1');
    });
  });

  describe('findByEventType', () => {
    it('should return logs by event type', async () => {
      prisma.webhookLog.findMany.mockResolvedValue([{ id: 'w1' }]);

      const result = await service.findByEventType('payment_intent.succeeded');

      expect(result).toHaveLength(1);
    });
  });
});
