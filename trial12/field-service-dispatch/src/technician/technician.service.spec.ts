import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TechnicianService } from './technician.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  technician: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirstOrThrow: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
};

describe('TechnicianService', () => {
  let service: TechnicianService;
  const companyId = 'company-1';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TechnicianService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TechnicianService>(TechnicianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a technician', async () => {
    const dto = { name: 'John', email: 'john@test.com', skills: ['plumbing'] };
    const expected = { id: '1', companyId, ...dto };
    mockPrisma.technician.create.mockResolvedValue(expected);

    const result = await service.create(companyId, dto);
    expect(result).toEqual(expected);
    expect(mockPrisma.technician.create).toHaveBeenCalledWith({
      data: { ...dto, companyId },
    });
  });

  it('should find all technicians scoped by companyId', async () => {
    const expected = [{ id: '1', name: 'John' }];
    mockPrisma.technician.findMany.mockResolvedValue(expected);

    const result = await service.findAll(companyId);
    expect(result).toEqual(expected);
    expect(mockPrisma.technician.findMany).toHaveBeenCalledWith({ where: { companyId } });
  });

  it('should find one technician scoped by companyId', async () => {
    const expected = { id: '1', name: 'John' };
    mockPrisma.technician.findFirstOrThrow.mockResolvedValue(expected);

    const result = await service.findOne(companyId, '1');
    expect(result).toEqual(expected);
    expect(mockPrisma.technician.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: '1', companyId },
    });
  });

  it('should update a technician', async () => {
    const dto = { name: 'Jane' };
    const expected = { id: '1', ...dto };
    mockPrisma.technician.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.technician.findUniqueOrThrow.mockResolvedValue(expected);

    const result = await service.update(companyId, '1', dto);
    expect(result).toEqual(expected);
  });

  it('should update GPS position', async () => {
    const dto = { lat: 40.7128, lng: -74.006 };
    const expected = { id: '1', currentLat: 40.7128, currentLng: -74.006 };
    mockPrisma.technician.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.technician.findUniqueOrThrow.mockResolvedValue(expected);

    const result = await service.updateGps(companyId, '1', dto);
    expect(result).toEqual(expected);
  });

  it('should delete a technician', async () => {
    mockPrisma.technician.deleteMany.mockResolvedValue({ count: 1 });

    const result = await service.remove(companyId, '1');
    expect(result).toEqual({ count: 1 });
  });
});
