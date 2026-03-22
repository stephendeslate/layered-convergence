// TRACED: FD-TEST-003 — Technicians service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechniciansService } from '../src/technicians/technicians.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TechniciansService', () => {
  let service: TechniciansService;
  let prisma: {
    technician: {
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
      technician: {
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
        TechniciansService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TechniciansService>(TechniciansService);
  });

  describe('create', () => {
    it('should create a technician with generated ID', async () => {
      prisma.technician.create.mockResolvedValue({
        id: 'tech_abc12345',
        name: 'Alice',
        status: 'AVAILABLE',
      });

      const result = await service.create('tenant-1', {
        name: 'Alice',
        latitude: '40.7580000',
        longitude: '-73.9855000',
      });

      expect(result.name).toBe('Alice');
      expect(prisma.technician.create).toHaveBeenCalledTimes(1);
    });

    it('should sanitize name input', async () => {
      prisma.technician.create.mockResolvedValue({ id: 'tech_abc12346', name: 'Bob' });

      await service.create('tenant-1', {
        name: '<b>Bob</b>',
        latitude: '40.7580000',
        longitude: '-73.9855000',
      });

      const arg = prisma.technician.create.mock.calls[0][0];
      expect(arg.data.name).toBe('Bob');
    });
  });

  describe('findAll', () => {
    it('should return paginated technicians', async () => {
      prisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', name: 'Alice', status: 'AVAILABLE' },
      ]);
      prisma.technician.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return technician with schedules', async () => {
      prisma.technician.findFirst.mockResolvedValue({
        id: 'tech-1',
        name: 'Alice',
        schedules: [],
      });

      const result = await service.findOne('tenant-1', 'tech-1');
      expect(result.id).toBe('tech-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'tech-missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update technician fields', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      prisma.technician.update.mockResolvedValue({
        id: 'tech-1',
        name: 'Updated Alice',
        status: 'BUSY',
      });

      const result = await service.update('tenant-1', 'tech-1', {
        name: 'Updated Alice',
        status: 'BUSY',
      });

      expect(result.name).toBe('Updated Alice');
    });

    it('should throw NotFoundException for missing technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.update('tenant-1', 'tech-missing', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a technician', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 'tech-1' });
      prisma.technician.delete.mockResolvedValue({ id: 'tech-1' });

      const result = await service.remove('tenant-1', 'tech-1');
      expect(result.id).toBe('tech-1');
    });

    it('should throw NotFoundException if technician missing', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'tech-missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
