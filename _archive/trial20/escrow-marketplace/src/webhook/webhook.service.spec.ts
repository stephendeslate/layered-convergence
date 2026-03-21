import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      webhookLog: {
        findUnique: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(WebhookService);
  });

  describe('process', () => {
    it('should create webhook log for new idempotency key', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({
        id: 'w1',
        idempotencyKey: 'key-1',
        event: 'payment.completed',
        payload: { amount: 100 },
      });

      const result = await service.process({
        idempotencyKey: 'key-1',
        event: 'payment.completed',
        payload: { amount: 100 },
      });

      expect(result.idempotencyKey).toBe('key-1');
    });

    it('should throw ConflictException for duplicate key', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue({ id: 'w1' });

      await expect(
        service.process({
          idempotencyKey: 'key-1',
          event: 'payment.completed',
          payload: {},
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should check for existing key before creating', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'w1' });

      await service.process({
        idempotencyKey: 'unique-key',
        event: 'test',
        payload: {},
      });

      expect(prisma.webhookLog.findUnique).toHaveBeenCalledWith({
        where: { idempotencyKey: 'unique-key' },
      });
    });
  });

  describe('findAll', () => {
    it('should return all webhook logs ordered by processedAt desc', async () => {
      prisma.webhookLog.findMany.mockResolvedValue([{ id: 'w1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(prisma.webhookLog.findMany).toHaveBeenCalledWith({
        orderBy: { processedAt: 'desc' },
      });
    });
  });

  describe('findByKey', () => {
    it('should return webhook log by idempotency key', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue({ idempotencyKey: 'k1' });
      const result = await service.findByKey('k1');
      expect(result.idempotencyKey).toBe('k1');
    });

    it('should return null for unknown key', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue(null);
      const result = await service.findByKey('unknown');
      expect(result).toBeNull();
    });
  });
});
