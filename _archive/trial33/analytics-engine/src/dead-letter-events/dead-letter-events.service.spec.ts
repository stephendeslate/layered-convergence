import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeadLetterEventsService } from './dead-letter-events.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DeadLetterEventsService', () => {
  let service: DeadLetterEventsService;
  let prisma: any;

  const mockEvent = {
    id: 'dle-1',
    sourceType: 'webhook',
    payload: { data: 'test' },
    errorReason: 'Invalid format',
    retriedAt: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      deadLetterEvent: {
        findMany: vi.fn().mockResolvedValue([mockEvent]),
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue(mockEvent),
        update: vi.fn(),
        delete: vi.fn().mockResolvedValue(mockEvent),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        DeadLetterEventsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DeadLetterEventsService>(DeadLetterEventsService);
  });

  describe('findAll', () => {
    it('should return events ordered by createdAt desc', async () => {
      await service.findAll();
      expect(prisma.deadLetterEvent.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return event by id', async () => {
      prisma.deadLetterEvent.findUnique.mockResolvedValue(mockEvent);
      const result = await service.findOne('dle-1');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.deadLetterEvent.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a dead letter event', async () => {
      await service.create({
        sourceType: 'api',
        errorReason: 'timeout',
        payload: { url: 'http://example.com' },
      });
      expect(prisma.deadLetterEvent.create).toHaveBeenCalledWith({
        data: {
          sourceType: 'api',
          errorReason: 'timeout',
          payload: { url: 'http://example.com' },
        },
      });
    });
  });

  describe('markRetried', () => {
    it('should set retriedAt timestamp', async () => {
      prisma.deadLetterEvent.update.mockResolvedValue({ ...mockEvent, retriedAt: new Date() });
      const result = await service.markRetried('dle-1');
      expect(result.retriedAt).toBeTruthy();
    });
  });

  describe('remove', () => {
    it('should delete a dead letter event', async () => {
      await service.remove('dle-1');
      expect(prisma.deadLetterEvent.delete).toHaveBeenCalledWith({ where: { id: 'dle-1' } });
    });
  });
});
