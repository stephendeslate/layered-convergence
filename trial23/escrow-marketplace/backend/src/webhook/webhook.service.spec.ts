import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let prisma: {
    webhook: { create: jest.Mock; findMany: jest.Mock };
  };

  const mockWebhook = {
    id: 'webhook-1',
    url: 'https://example.com/hook',
    event: 'transaction.completed',
    userId: 'user-1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      webhook: {
        create: jest.fn(),
        findMany: jest.fn(),
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
    it('should create a webhook for the user', async () => {
      prisma.webhook.create.mockResolvedValue(mockWebhook);

      const result = await service.create(
        { url: 'https://example.com/hook', event: 'transaction.completed' },
        'user-1',
      );

      expect(result).toEqual(mockWebhook);
      expect(prisma.webhook.create).toHaveBeenCalledWith({
        data: {
          url: 'https://example.com/hook',
          event: 'transaction.completed',
          userId: 'user-1',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return webhooks for the user', async () => {
      prisma.webhook.findMany.mockResolvedValue([mockWebhook]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(1);
      expect(prisma.webhook.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no webhooks exist', async () => {
      prisma.webhook.findMany.mockResolvedValue([]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(0);
    });
  });
});
