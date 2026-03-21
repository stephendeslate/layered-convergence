import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let prisma: {
    webhook: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      webhook: {
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  describe('create', () => {
    it('should create a webhook event', async () => {
      prisma.webhook.create.mockResolvedValue({
        id: 'wh-1',
        event: 'transaction.funded',
        payload: '{"amount": 100}',
        transactionId: 'tx-1',
      });

      const result = await service.create(
        'tx-1',
        'transaction.funded',
        '{"amount": 100}',
      );
      expect(result.event).toBe('transaction.funded');
    });
  });

  describe('findByTransaction', () => {
    it('should return webhooks for a transaction', async () => {
      prisma.webhook.findMany.mockResolvedValue([
        { id: 'wh-1', event: 'transaction.funded' },
        { id: 'wh-2', event: 'transaction.shipped' },
      ]);

      const result = await service.findByTransaction('tx-1');
      expect(result).toHaveLength(2);
    });
  });

  describe('markDelivered', () => {
    it('should set deliveredAt timestamp', async () => {
      prisma.webhook.update.mockResolvedValue({
        id: 'wh-1',
        deliveredAt: new Date(),
      });

      const result = await service.markDelivered('wh-1');
      expect(result.deliveredAt).toBeDefined();
    });
  });
});
