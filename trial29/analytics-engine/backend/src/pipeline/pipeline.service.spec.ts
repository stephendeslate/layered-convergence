import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma.service';

describe('PipelineService', () => {
  let service: PipelineService;

  const mockPrisma = {
    pipeline: {
      findMany: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAllByTenant returns pipelines for tenant', async () => {
    const pipelines = [
      { id: '1', name: 'Pipeline 1', status: 'DRAFT', tenantId: 't1' },
    ];
    mockPrisma.pipeline.findMany.mockResolvedValue(pipelines);

    const result = await service.findAllByTenant('t1');
    expect(result).toEqual(pipelines);
    expect(mockPrisma.pipeline.findMany).toHaveBeenCalledWith({
      where: { tenantId: 't1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('transitionStatus validates state machine transitions', async () => {
    mockPrisma.pipeline.findFirst.mockResolvedValue({
      id: '1',
      status: 'DRAFT',
    });
    mockPrisma.pipeline.update.mockResolvedValue({
      id: '1',
      status: 'ACTIVE',
    });

    const result = await service.transitionStatus('1', 'ACTIVE');
    expect(result.status).toBe('ACTIVE');
  });

  it('transitionStatus rejects invalid transitions', async () => {
    mockPrisma.pipeline.findFirst.mockResolvedValue({
      id: '1',
      status: 'ARCHIVED',
    });

    await expect(
      service.transitionStatus('1', 'ACTIVE'),
    ).rejects.toThrow(BadRequestException);
  });

  it('transitionStatus throws when pipeline not found', async () => {
    mockPrisma.pipeline.findFirst.mockResolvedValue(null);

    await expect(
      service.transitionStatus('missing', 'ACTIVE'),
    ).rejects.toThrow(BadRequestException);
  });

  it('countByTenantRaw returns count from raw SQL', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ count: BigInt(5) }]);

    const count = await service.countByTenantRaw('t1');
    expect(count).toBe(5);
  });

  it('activatePipeline uses $executeRaw and returns pipeline', async () => {
    const pipeline = { id: '1', status: 'ACTIVE' };
    mockPrisma.$executeRaw.mockResolvedValue(1);
    mockPrisma.pipeline.findFirst.mockResolvedValue(pipeline);

    const result = await service.activatePipeline('1');
    expect(result).toEqual(pipeline);
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
  });
});
