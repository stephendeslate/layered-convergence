import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { RouteService } from './route.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  route: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
};

describe('RouteService', () => {
  let service: RouteService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a route', async () => {
    const dto = {
      technicianId: 'tech-1',
      date: '2024-01-15T00:00:00.000Z',
      waypoints: [{ lat: 40.7, lng: -74.0 }],
    };
    const expected = { id: 'route-1', ...dto };
    mockPrisma.route.create.mockResolvedValue(expected);

    const result = await service.create(dto);
    expect(result).toEqual(expected);
  });

  it('should find routes by technician', async () => {
    const expected = [{ id: 'route-1' }];
    mockPrisma.route.findMany.mockResolvedValue(expected);

    const result = await service.findByTechnician('tech-1');
    expect(result).toEqual(expected);
    expect(mockPrisma.route.findMany).toHaveBeenCalledWith({
      where: { technicianId: 'tech-1' },
      orderBy: { date: 'asc' },
    });
  });

  it('should find one route', async () => {
    const expected = { id: 'route-1' };
    mockPrisma.route.findUniqueOrThrow.mockResolvedValue(expected);

    const result = await service.findOne('route-1');
    expect(result).toEqual(expected);
  });

  it('should optimize a route (stub)', async () => {
    const expected = { id: 'route-1', optimizedOrder: { stub: true } };
    mockPrisma.route.update.mockResolvedValue(expected);

    const result = await service.optimize('route-1');
    expect(result).toEqual(expected);
  });
});
