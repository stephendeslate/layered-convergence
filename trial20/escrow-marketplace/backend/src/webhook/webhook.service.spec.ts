import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('WebhookService', () => {
  let service: WebhookService;
  let prisma: {
    webhook: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      webhook: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
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
    it('should create a webhook', async () => {
      const dto = { url: 'https://example.com/hook', event: 'transaction.created' };
      prisma.webhook.create.mockResolvedValue({
        id: 'wh-1',
        ...dto,
        payload: {},
        status: 'PENDING',
      });

      const result = await service.create(dto);
      expect(result.id).toBe('wh-1');
      expect(result.event).toBe('transaction.created');
    });
  });

  describe('findAll', () => {
    it('should return all webhooks', async () => {
      prisma.webhook.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a webhook by id', async () => {
      prisma.webhook.findUnique.mockResolvedValue({ id: 'wh-1' });
      const result = await service.findOne('wh-1');
      expect(result.id).toBe('wh-1');
    });

    it('should throw NotFoundException when webhook not found', async () => {
      prisma.webhook.findUnique.mockResolvedValue(null);
      await expect(service.findOne('wh-1')).rejects.toThrow(NotFoundException);
    });
  });
});
