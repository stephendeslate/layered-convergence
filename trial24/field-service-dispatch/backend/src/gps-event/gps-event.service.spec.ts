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
    it('should return GPS events for a company', async () => {
      const mockEvents = [{ id: '1', latitude: 40.7128, longitude: -74.006 }];
      prisma.gpsEvent.findMany.mockResolvedValue(mockEvents);

      const result = await service.findAll('c-1');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('findOne', () => {
    it('should return a GPS event by id and company', async () => {
      const mockEvent = { id: '1', latitude: 40.7128, longitude: -74.006, companyId: 'c-1' };
      prisma.gpsEvent.findFirst.mockResolvedValue(mockEvent);

      const result = await service.findOne('1', 'c-1');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.gpsEvent.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad', 'c-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a GPS event', async () => {
      const data = {
        latitude: 40.7128,
        longitude: -74.006,
        timestamp: new Date(),
        technicianId: 'tech-1',
        companyId: 'c-1',
      };

      prisma.gpsEvent.create.mockResolvedValue({ id: '1', ...data });

      const result = await service.create(data);
      expect(result.latitude).toBe(40.7128);
    });
  });

  describe('findByTechnician', () => {
    it('should return GPS events for a specific technician', async () => {
      const mockEvents = [{ id: '1', technicianId: 'tech-1' }];
      prisma.gpsEvent.findMany.mockResolvedValue(mockEvents);

      const result = await service.findByTechnician('tech-1', 'c-1');
      expect(result).toEqual(mockEvents);
    });
  });
});
