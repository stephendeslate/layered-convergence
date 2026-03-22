// TRACED:AE-TEST-02 — Events service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: {
    event: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      event: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an event', async () => {
    const mockEvent = { id: '1', type: 'CLICK', name: 'Test', tenantId: 't1', createdAt: new Date() };
    prisma.event.create.mockResolvedValue(mockEvent);

    const result = await service.create({
      type: 'CLICK',
      name: 'Test',
      tenantId: 't1',
    });

    expect(result).toEqual(mockEvent);
    expect(prisma.event.create).toHaveBeenCalled();
  });

  it('should throw NotFoundException when event not found', async () => {
    prisma.event.findFirst.mockResolvedValue(null);

    await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('should return paginated events', async () => {
    prisma.event.findMany.mockResolvedValue([]);
    prisma.event.count.mockResolvedValue(0);

    const result = await service.findAll('t1', 1, 20);

    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
    expect(result.meta.page).toBe(1);
  });
});
