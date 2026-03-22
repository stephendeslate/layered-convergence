import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventsService } from '../src/events/events.service';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED:AE-TEST-003
describe('EventsService', () => {
  let service: EventsService;
  let prisma: {
    event: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      event: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
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
      const dto = { type: 'CLICK', source: 'web', tenantId: 'tenant-1' };
      prisma.event.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(result.id).toBe('1');
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      prisma.event.findMany.mockResolvedValue([{ id: '1' }]);
      prisma.event.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should clamp page size', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', 1, 500);
      expect(result.pageSize).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should return an event', async () => {
      prisma.event.findFirst.mockResolvedValue({ id: '1', type: 'CLICK' });
      const result = await service.findOne('1');
      expect(result.type).toBe('CLICK');
    });

    it('should throw NotFoundException', async () => {
      prisma.event.findFirst.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an event status', async () => {
      prisma.event.findFirst.mockResolvedValue({ id: '1' });
      prisma.event.update.mockResolvedValue({ id: '1', status: 'PROCESSED' });

      const result = await service.update('1', { status: 'PROCESSED' });
      expect(result.status).toBe('PROCESSED');
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      prisma.event.findFirst.mockResolvedValue({ id: '1' });
      prisma.event.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result.id).toBe('1');
    });
  });
});
