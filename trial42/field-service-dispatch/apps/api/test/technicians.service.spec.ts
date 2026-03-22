// TRACED: FD-TECHNICIANS-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechniciansService } from '../src/technicians/technicians.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TechniciansService', () => {
  let service: TechniciansService;

  const mockPrisma = {
    technician: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechniciansService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TechniciansService>(TechniciansService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a technician', async () => {
      const dto = {
        name: 'John Smith',
        email: 'john@test.com',
        phone: '555-0101',
        specialties: ['electrical'],
        latitude: 40.7128,
        longitude: -74.006,
        tenantId: 'tenant-1',
      };

      mockPrisma.technician.create.mockResolvedValue({
        id: 'tech-1',
        ...dto,
        status: 'AVAILABLE',
      });

      const result = await service.create(dto);
      expect(result.name).toBe('John Smith');
    });
  });

  describe('findAll', () => {
    it('should return paginated technicians', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', name: 'John Smith' },
      ]);
      mockPrisma.technician.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by tenantId when provided', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([]);
      mockPrisma.technician.count.mockResolvedValue(0);

      await service.findAll(1, 10, 'tenant-1');
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a technician by id', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({
        id: 'tech-1',
        name: 'John Smith',
      });

      const result = await service.findOne('tech-1');
      expect(result.id).toBe('tech-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({
        id: 'tech-1',
        name: 'John Smith',
      });
      mockPrisma.technician.update.mockResolvedValue({
        id: 'tech-1',
        name: 'John Updated',
      });

      const result = await service.update('tech-1', { name: 'John Updated' });
      expect(result.name).toBe('John Updated');
    });
  });

  describe('remove', () => {
    it('should delete a technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({
        id: 'tech-1',
        name: 'John Smith',
      });
      mockPrisma.technician.delete.mockResolvedValue({});

      await service.remove('tech-1');
      expect(mockPrisma.technician.delete).toHaveBeenCalledWith({
        where: { id: 'tech-1' },
      });
    });
  });
});
