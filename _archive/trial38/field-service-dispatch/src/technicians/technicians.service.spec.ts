import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TechniciansService', () => {
  let service: TechniciansService;
  let prisma: any;
  const companyId = 'company-1';

  beforeEach(async () => {
    prisma = {
      technician: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
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

  it('should create a technician', async () => {
    const dto = { name: 'Bob', skills: ['HVAC', 'plumbing'] };
    prisma.technician.create.mockResolvedValue({ id: '1', ...dto, companyId });
    const result = await service.create(companyId, dto);
    expect(result.name).toBe('Bob');
    expect(prisma.technician.create).toHaveBeenCalledWith({
      data: { ...dto, companyId },
    });
  });

  it('should create technician with empty skills by default', async () => {
    const dto = { name: 'No Skills' };
    prisma.technician.create.mockResolvedValue({ id: '2', name: 'No Skills', skills: [], companyId });
    await service.create(companyId, dto);
    expect(prisma.technician.create).toHaveBeenCalledWith({
      data: { name: 'No Skills', skills: [], companyId },
    });
  });

  it('should find all technicians for company', async () => {
    prisma.technician.findMany.mockResolvedValue([{ id: '1', companyId }]);
    const result = await service.findAll(companyId);
    expect(result).toHaveLength(1);
  });

  it('should find one technician', async () => {
    prisma.technician.findFirst.mockResolvedValue({ id: '1', companyId });
    const result = await service.findOne(companyId, '1');
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException for missing technician', async () => {
    prisma.technician.findFirst.mockResolvedValue(null);
    await expect(service.findOne(companyId, 'x')).rejects.toThrow(NotFoundException);
  });

  it('should update a technician', async () => {
    prisma.technician.findFirst.mockResolvedValue({ id: '1', companyId });
    prisma.technician.update.mockResolvedValue({ id: '1', status: 'BUSY' });
    const result = await service.update(companyId, '1', { status: 'BUSY' } as any);
    expect(result.status).toBe('BUSY');
  });

  it('should delete a technician', async () => {
    prisma.technician.findFirst.mockResolvedValue({ id: '1', companyId });
    prisma.technician.delete.mockResolvedValue({ id: '1' });
    await service.remove(companyId, '1');
    expect(prisma.technician.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  describe('findNearestAvailable', () => {
    it('should find nearest available technician', async () => {
      prisma.technician.findMany.mockResolvedValue([
        { id: 't1', skills: ['HVAC'], currentLat: 40.71, currentLng: -74.01, status: 'AVAILABLE' },
        { id: 't2', skills: ['HVAC'], currentLat: 40.75, currentLng: -73.98, status: 'AVAILABLE' },
      ]);

      const result = await service.findNearestAvailable(companyId, 40.72, -74.0, ['HVAC']);
      expect(result).toBeDefined();
      expect(result!.id).toBe('t1');
    });

    it('should return null when no available technicians', async () => {
      prisma.technician.findMany.mockResolvedValue([]);
      const result = await service.findNearestAvailable(companyId, 40.72, -74.0, []);
      expect(result).toBeNull();
    });

    it('should filter by required skills', async () => {
      prisma.technician.findMany.mockResolvedValue([
        { id: 't1', skills: ['plumbing'], currentLat: 40.71, currentLng: -74.01 },
        { id: 't2', skills: ['HVAC', 'electrical'], currentLat: 40.75, currentLng: -73.98 },
      ]);

      const result = await service.findNearestAvailable(companyId, 40.72, -74.0, ['electrical']);
      expect(result!.id).toBe('t2');
    });
  });
});
