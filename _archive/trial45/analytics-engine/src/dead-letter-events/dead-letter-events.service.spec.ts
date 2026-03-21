import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeadLetterEventsService } from './dead-letter-events.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DeadLetterEventsService', () => {
  let service: DeadLetterEventsService;
  let prisma: any;

  const mockEvent = {
    id: 'dle-1',
    dataSourceId: 'ds-1',
    payload: { event: 'page_view' },
    errorReason: 'Invalid schema',
    createdAt: new Date(),
    retriedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      deadLetterEvent: {
        create: vi.fn().mockResolvedValue(mockEvent),
        findMany: vi.fn().mockResolvedValue([mockEvent]),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn().mockResolvedValue(mockEvent),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeadLetterEventsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DeadLetterEventsService>(DeadLetterEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dead letter event', async () => {
      const result = await service.create({
        dataSourceId: 'ds-1',
        payload: { event: 'page_view' },
        errorReason: 'Invalid schema',
      });
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findByDataSource', () => {
    it('should return events for a data source', async () => {
      const result = await service.findByDataSource('ds-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return event when found', async () => {
      prisma.deadLetterEvent.findUnique.mockResolvedValue(mockEvent);
      const result = await service.findById('dle-1');
      expect(result.id).toBe('dle-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.deadLetterEvent.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('retry', () => {
    it('should set retriedAt timestamp', async () => {
      prisma.deadLetterEvent.update.mockResolvedValue({ ...mockEvent, retriedAt: new Date() });
      const result = await service.retry('dle-1');
      expect(result.retriedAt).not.toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete event', async () => {
      await service.remove('dle-1');
      expect(prisma.deadLetterEvent.delete).toHaveBeenCalledWith({ where: { id: 'dle-1' } });
    });
  });
});
