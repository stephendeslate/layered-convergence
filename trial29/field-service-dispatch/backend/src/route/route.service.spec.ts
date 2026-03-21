import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../prisma.service';

describe('RouteService', () => {
  let service: RouteService;

  const mockPrisma = {
    route: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAllByCompany returns routes with technician', async () => {
    const routes = [
      { id: 'r1', name: 'AM Route', status: 'PLANNED', companyId: 'c1', technician: {} },
    ];
    mockPrisma.route.findMany.mockResolvedValue(routes);

    const result = await service.findAllByCompany('c1');
    expect(result).toEqual(routes);
    expect(mockPrisma.route.findMany).toHaveBeenCalledWith({
      where: { companyId: 'c1' },
      include: { technician: true },
      orderBy: { date: 'desc' },
    });
  });

  it('findById returns route when found', async () => {
    const route = { id: 'r1', name: 'AM Route', technician: {} };
    mockPrisma.route.findFirst.mockResolvedValue(route);

    const result = await service.findById('r1');
    expect(result).toEqual(route);
  });

  it('findById throws BadRequestException when not found', async () => {
    mockPrisma.route.findFirst.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('create creates a new route', async () => {
    const created = { id: 'r1', name: 'New Route', status: 'PLANNED' };
    mockPrisma.route.create.mockResolvedValue(created);

    const result = await service.create({
      name: 'New Route',
      date: new Date('2026-03-25'),
      technicianId: 'tech-1',
      companyId: 'c1',
    });
    expect(result).toEqual(created);
  });

  it('transitionStatus validates state machine transitions', async () => {
    mockPrisma.route.findFirst.mockResolvedValue({
      id: 'r1',
      status: 'PLANNED',
    });
    mockPrisma.route.update.mockResolvedValue({
      id: 'r1',
      status: 'ACTIVE',
    });

    const result = await service.transitionStatus('r1', 'ACTIVE');
    expect(result.status).toBe('ACTIVE');
  });

  it('transitionStatus rejects invalid transitions', async () => {
    mockPrisma.route.findFirst.mockResolvedValue({
      id: 'r1',
      status: 'COMPLETED',
    });

    await expect(
      service.transitionStatus('r1', 'ACTIVE'),
    ).rejects.toThrow(BadRequestException);
  });

  it('transitionStatus throws when route not found', async () => {
    mockPrisma.route.findFirst.mockResolvedValue(null);

    await expect(
      service.transitionStatus('missing', 'ACTIVE'),
    ).rejects.toThrow(BadRequestException);
  });
});
