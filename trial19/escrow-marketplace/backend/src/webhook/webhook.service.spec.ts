import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookService } from './webhook.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  webhook: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
};

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WebhookService(mockPrisma as never);
  });

  describe('create', () => {
    it('should create a webhook', async () => {
      mockPrisma.webhook.create.mockResolvedValue({
        id: 'wh-1',
        url: 'https://example.com/hook',
        eventType: 'transaction.funded',
        secret: 'secret-123',
      });

      const result = await service.create({
        url: 'https://example.com/hook',
        eventType: 'transaction.funded',
        secret: 'secret-123',
      });

      expect(result.id).toBe('wh-1');
      expect(result.url).toBe('https://example.com/hook');
    });
  });

  describe('findById', () => {
    it('should return a webhook by id', async () => {
      mockPrisma.webhook.findUnique.mockResolvedValue({
        id: 'wh-1',
        url: 'https://example.com/hook',
      });

      const result = await service.findById('wh-1');
      expect(result.id).toBe('wh-1');
    });

    it('should throw NotFoundException for missing webhook', async () => {
      mockPrisma.webhook.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing webhook', async () => {
      mockPrisma.webhook.findUnique.mockResolvedValue({ id: 'wh-1' });
      mockPrisma.webhook.delete.mockResolvedValue({ id: 'wh-1' });

      const result = await service.delete('wh-1');
      expect(result.id).toBe('wh-1');
    });

    it('should throw NotFoundException when deleting nonexistent webhook', async () => {
      mockPrisma.webhook.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
