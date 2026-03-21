import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let prisma: any;

  const mockEndpoint = {
    id: 'endpoint-1',
    userId: 'user-1',
    url: 'https://example.com/webhook',
    secret: 'secret-key',
    active: true,
    events: ['transaction.updated'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEvent = {
    id: 'event-1',
    endpointId: 'endpoint-1',
    eventType: 'transaction.updated',
    payload: { id: 'txn-1' },
    idempotencyKey: 'key-1',
    processedAt: null,
    attempts: 0,
    lastError: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      webhookEndpoint: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
      webhookEvent: {
        create: vi.fn(),
        findMany: vi.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEndpoint', () => {
    it('should create endpoint with generated secret', async () => {
      prisma.webhookEndpoint.create.mockResolvedValue(mockEndpoint);

      const result = await service.createEndpoint('user-1', {
        url: 'https://example.com/webhook',
        events: ['transaction.updated'],
      });

      expect(prisma.webhookEndpoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          url: 'https://example.com/webhook',
          secret: expect.any(String),
        }),
      });
    });
  });

  describe('findEndpoints', () => {
    it('should return endpoints for user', async () => {
      prisma.webhookEndpoint.findMany.mockResolvedValue([mockEndpoint]);

      const result = await service.findEndpoints('user-1');
      expect(result).toHaveLength(1);
      expect(prisma.webhookEndpoint.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });
  });

  describe('findEndpointById', () => {
    it('should return endpoint by id', async () => {
      prisma.webhookEndpoint.findUnique.mockResolvedValue(mockEndpoint);

      const result = await service.findEndpointById('endpoint-1');
      expect(result).toEqual(mockEndpoint);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.webhookEndpoint.findUnique.mockResolvedValue(null);

      await expect(service.findEndpointById('bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteEndpoint', () => {
    it('should delete endpoint', async () => {
      prisma.webhookEndpoint.delete.mockResolvedValue(mockEndpoint);

      await service.deleteEndpoint('endpoint-1');
      expect(prisma.webhookEndpoint.delete).toHaveBeenCalledWith({
        where: { id: 'endpoint-1' },
      });
    });
  });

  describe('createEvent', () => {
    it('should create webhook event', async () => {
      prisma.webhookEvent.create.mockResolvedValue(mockEvent);

      const result = await service.createEvent(
        'endpoint-1',
        'transaction.updated',
        { id: 'txn-1' },
        'key-1',
      );

      expect(prisma.webhookEvent.create).toHaveBeenCalledWith({
        data: {
          endpointId: 'endpoint-1',
          eventType: 'transaction.updated',
          payload: { id: 'txn-1' },
          idempotencyKey: 'key-1',
        },
      });
    });
  });

  describe('findEvents', () => {
    it('should return events for endpoint', async () => {
      prisma.webhookEvent.findMany.mockResolvedValue([mockEvent]);

      const result = await service.findEvents('endpoint-1');
      expect(result).toHaveLength(1);
    });
  });
});
