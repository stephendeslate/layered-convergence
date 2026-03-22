import { Test, TestingModule } from '@nestjs/testing';
import { TechnicianService } from '../src/technician/technician.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

// TRACED: FD-TECHNICIAN-UNIT-TEST
describe('TechnicianService', () => {
  let service: TechnicianService;
  let prisma: {
    technician: {
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
      technician: {
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
        TechnicianService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TechnicianService>(TechnicianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a technician', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@test.com',
        phone: '555-0100',
        specialties: ['electrical'],
        latitude: 40.7128,
        longitude: -74.006,
      };

      prisma.technician.create.mockResolvedValue({
        id: 'tech-1',
        ...dto,
        status: 'AVAILABLE',
        createdAt: new Date(),
      });

      const result = await service.create(dto, 'tenant-1');
      expect(result.id).toBe('tech-1');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated technicians', async () => {
      prisma.technician.findMany.mockResolvedValue([]);
      prisma.technician.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');
      expect(result.data).toEqual([]);
      expect(result.page).toBe(1);
    });
  });
});
