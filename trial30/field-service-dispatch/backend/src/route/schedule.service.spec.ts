import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { PrismaService } from '../prisma.service';

describe('ScheduleService', () => {
  let service: ScheduleService;

  const mockPrisma = {
    schedule: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByTechnician', () => {
    it('should return schedules for a technician ordered by day', async () => {
      const schedules = [
        { id: 's1', dayOfWeek: 'Monday', startTime: '08:00', endTime: '17:00' },
        { id: 's2', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '18:00' },
      ];
      mockPrisma.schedule.findMany.mockResolvedValue(schedules);

      const result = await service.findByTechnician('tech-1');

      expect(mockPrisma.schedule.findMany).toHaveBeenCalledWith({
        where: { technicianId: 'tech-1' },
        orderBy: { dayOfWeek: 'asc' },
      });
      expect(result).toEqual(schedules);
    });
  });

  describe('findById', () => {
    it('should return a schedule with technician', async () => {
      const schedule = {
        id: 's1',
        dayOfWeek: 'Monday',
        technician: { id: 'tech-1', email: 'tech@example.com' },
      };
      mockPrisma.schedule.findFirst.mockResolvedValue(schedule);

      const result = await service.findById('s1');
      expect(result).toEqual(schedule);
    });

    it('should throw NotFoundException when schedule not found', async () => {
      mockPrisma.schedule.findFirst.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new schedule', async () => {
      const data = {
        dayOfWeek: 'Wednesday',
        startTime: '08:00',
        endTime: '16:00',
        technicianId: 'tech-1',
      };
      mockPrisma.schedule.create.mockResolvedValue({ id: 's3', ...data });

      const result = await service.create(data);

      expect(mockPrisma.schedule.create).toHaveBeenCalledWith({ data });
      expect(result.dayOfWeek).toBe('Wednesday');
    });
  });

  describe('delete', () => {
    it('should delete an existing schedule', async () => {
      mockPrisma.schedule.findFirst.mockResolvedValue({ id: 's1' });
      mockPrisma.schedule.delete.mockResolvedValue({ id: 's1' });

      const result = await service.delete('s1');
      expect(result.id).toBe('s1');
    });

    it('should throw NotFoundException when schedule not found for delete', async () => {
      mockPrisma.schedule.findFirst.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
