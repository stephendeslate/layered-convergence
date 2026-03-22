// TRACED: FD-TECH-005 — Technicians service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechniciansService } from '../src/technicians/technicians.service';
import { PrismaService } from '../src/prisma/prisma.service';

const mockPrisma = {
  technician: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TechniciansService', () => {
  let service: TechniciansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechniciansService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TechniciansService>(TechniciansService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a technician with sanitized name', async () => {
      mockPrisma.technician.create.mockResolvedValue({
        id: 'tech_test01',
        name: 'Jane Doe',
        status: 'AVAILABLE',
      });

      const result = await service.create('tenant-1', {
        name: '<i>Jane Doe</i>',
        specialty: 'HVAC',
        latitude: '40.7128',
        longitude: '-74.0060',
      });

      expect(result.name).toBe('Jane Doe');
      expect(mockPrisma.technician.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: expect.not.stringContaining('<i>'),
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated technicians', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech_1', name: 'T1' },
        { id: 'tech_2', name: 'T2' },
      ]);
      mockPrisma.technician.count.mockResolvedValue(2);

      const result = await service.findAll('tenant-1', 1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.pageSize).toBe(20);
    });

    it('should use select optimization', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([]);
      mockPrisma.technician.count.mockResolvedValue(0);

      await service.findAll('tenant-1', 1, 10);

      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            name: true,
            status: true,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'tech_none')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should include schedules relation', async () => {
      const mockTech = {
        id: 'tech_1',
        name: 'Jane',
        schedules: [],
      };
      mockPrisma.technician.findFirst.mockResolvedValue(mockTech);

      const result = await service.findOne('tenant-1', 'tech_1');
      expect(result.schedules).toBeDefined();
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when technician not in tenant', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.update('tenant-1', 'tech_none', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only provided fields', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 'tech_1' });
      mockPrisma.technician.update.mockResolvedValue({
        id: 'tech_1',
        status: 'BUSY',
      });

      await service.update('tenant-1', 'tech_1', { status: 'BUSY' });

      expect(mockPrisma.technician.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'BUSY' }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete technician after verifying tenant', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 'tech_1' });
      mockPrisma.technician.delete.mockResolvedValue({ id: 'tech_1' });

      const result = await service.remove('tenant-1', 'tech_1');
      expect(result.id).toBe('tech_1');
    });
  });
});
