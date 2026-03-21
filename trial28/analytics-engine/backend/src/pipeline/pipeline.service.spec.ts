import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../prisma.service';

describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: PrismaService;

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
    prisma = module.get<PrismaService>(PrismaService);
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

  it('transitionStatus updates pipeline status', async () => {
    const updated = { id: '1', status: 'ACTIVE' };
    mockPrisma.pipeline.update.mockResolvedValue(updated);

    const result = await service.transitionStatus('1', 'ACTIVE');
    expect(result).toEqual(updated);
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
