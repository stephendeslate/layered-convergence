import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GpsEventService } from './gps-event.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GpsEventService', () => {
  let service: GpsEventService;
  let prisma: {
    gpsEvent: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      gpsEvent: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpsEventService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<GpsEventService>(GpsEventService);
  });

  describe('findAll', () => {
    it('should return all GPS events for company', async () => {
      const events = [{ id: '1', latitude: 40.7128, longitude: -74.006, companyId: 'c1' }];
      prisma.gpsEvent.findMany.mockResolvedValue(events);

      const result = await service.findAll('c1');
      expect(result).toEqual(events);
    });
  });

  describe('findOne', () => {
    it('should return a GPS event', async () => {
      const event = { id: '1', latitude: 40.7128, longitude: -74.006, companyId: 'c1' };
      prisma.gpsEvent.findFirst.mockResolvedValue(event);

      const result = await service.findOne('1', 'c1');
      expect(result).toEqual(event);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.gpsEvent.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a GPS event', async () => {
      const data = {
        latitude: 40.7128,
        longitude: -74.006,
        timestamp: new Date(),
        technicianId: 'tech-1',
        companyId: 'c1',
      };

      prisma.gpsEvent.create.mockResolvedValue({ id: '1', ...data });

      const result = await service.create(data);
      expect(result.latitude).toBe(40.7128);
      expect(result.longitude).toBe(-74.006);
    });
  });
});
