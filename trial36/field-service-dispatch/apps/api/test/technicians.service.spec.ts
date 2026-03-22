// TRACED: FD-TEST-003 — Technicians service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechniciansService } from '../src/technicians/technicians.service';
import { PrismaService } from '../src/prisma.service';

describe('TechniciansService', () => {
  let service: TechniciansService;
  let prisma: { technician: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock } };

  beforeEach(async () => {
    prisma = { technician: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn() } };

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
      prisma.technician.create.mockResolvedValue({ id: 'tech_abc12345', name: 'John' });

      const result = await service.create('tenant-1', { name: 'John', latitude: '40.7128', longitude: '-74.006' });

      expect(result.id).toBeDefined();
      const createArg = prisma.technician.create.mock.calls[0][0];
      expect(createArg.data.id).toMatch(/^tech_/);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.technician.findMany.mockResolvedValue([{ id: '1', name: 'John' }]);
      prisma.technician.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return technician with schedules', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: '1', name: 'John', schedules: [] });

      const result = await service.findOne('tenant-1', '1');
      expect(result.name).toBe('John');
    });

    it('should throw NotFoundException when technician not found', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.findOne('tenant-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
