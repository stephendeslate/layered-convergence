import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from '../technician.service';
import { PrismaService } from '../../prisma.service';

// TRACED: FD-TST-TECH-001 — Technician service unit tests
describe('TechnicianService', () => {
  let service: TechnicianService;
  let prisma: {
    technicianProfile: { findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      technicianProfile: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        update: jest.fn(),
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

  it('should throw NotFoundException for unknown profile', async () => {
    prisma.technicianProfile.findFirst.mockResolvedValue(null);
    await expect(
      service.updateAvailability('nonexistent', 'BUSY'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update availability status', async () => {
    prisma.technicianProfile.findFirst.mockResolvedValue({ id: '1' });
    prisma.technicianProfile.update.mockResolvedValue({ id: '1', availability: 'BUSY' });
    const result = await service.updateAvailability('1', 'BUSY');
    expect(result.availability).toBe('BUSY');
  });

  it('should find available technicians', async () => {
    prisma.technicianProfile.findMany.mockResolvedValue([
      { id: '1', availability: 'AVAILABLE', user: { email: 'tech@test.com' } },
    ]);
    const result = await service.findAvailable();
    expect(result).toHaveLength(1);
  });
});
