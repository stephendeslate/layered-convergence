// TRACED:AE-EVENTS-UNIT-TEST
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventsService } from '../src/events/events.service';
import { PrismaService } from '../src/prisma.service';

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

  describe('create', () => {
    it('should create an event', async () => {
      const mockEvent = { id: 'event-1', name: 'Test Event', status: 'PENDING' };
      prisma.event.create.mockResolvedValue(mockEvent);

      const result = await service.create('tenant-1', { name: 'Test Event' });
      expect(result).toEqual(mockEvent);
      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId: 'tenant-1' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      prisma.event.findMany.mockResolvedValue([{ id: 'event-1' }]);
      prisma.event.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', 1, 500);
      expect(result.pageSize).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should return an event by ID', async () => {
      const mockEvent = { id: 'event-1', name: 'Test Event' };
      prisma.event.findFirst.mockResolvedValue(mockEvent);

      const result = await service.findOne('event-1', 'tenant-1');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event not found', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      prisma.event.findFirst.mockResolvedValue({ id: 'event-1' });
      prisma.event.delete.mockResolvedValue({ id: 'event-1' });

      const result = await service.remove('event-1', 'tenant-1');
      expect(result.deleted).toBe(true);
    });
  });
});
