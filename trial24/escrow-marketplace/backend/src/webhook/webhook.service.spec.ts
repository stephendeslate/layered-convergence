import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let prisma: {
    webhook: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; delete: jest.Mock };
  };
  let tenantContext: { setCurrentUser: jest.Mock };

  beforeEach(async () => {
    prisma = {
      webhook: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), delete: jest.fn() },
    };

    tenantContext = { setCurrentUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  describe('create', () => {
    it('should create a webhook', async () => {
      prisma.webhook.create.mockResolvedValue({
        id: 'wh-1',
        url: 'https://example.com/hook',
        event: 'transaction.completed',
      });

      const result = await service.create('user-1', {
        url: 'https://example.com/hook',
        event: 'transaction.completed',
        secret: 'webhook-secret',
      });

      expect(result.id).toBe('wh-1');
      expect(tenantContext.setCurrentUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findAll', () => {
    it('should return webhooks for user', async () => {
      prisma.webhook.findMany.mockResolvedValue([{ id: 'wh-1' }, { id: 'wh-2' }]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return webhook by id', async () => {
      prisma.webhook.findFirst.mockResolvedValue({ id: 'wh-1', userId: 'user-1' });

      const result = await service.findOne('user-1', 'wh-1');

      expect(result.id).toBe('wh-1');
    });

    it('should throw NotFoundException for missing webhook', async () => {
      prisma.webhook.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'bad-wh')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a webhook', async () => {
      prisma.webhook.findFirst.mockResolvedValue({ id: 'wh-1', userId: 'user-1' });
      prisma.webhook.delete.mockResolvedValue({ id: 'wh-1' });

      const result = await service.delete('user-1', 'wh-1');

      expect(result.id).toBe('wh-1');
    });

    it('should throw NotFoundException when deleting non-existent webhook', async () => {
      prisma.webhook.findFirst.mockResolvedValue(null);

      await expect(service.delete('user-1', 'bad-wh')).rejects.toThrow(NotFoundException);
    });
  });
});
