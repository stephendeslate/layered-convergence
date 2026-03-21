import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    expect(service).toHaveProperty('$connect');
    expect(service).toHaveProperty('$disconnect');
  });

  it('should implement onModuleInit', () => {
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should implement onModuleDestroy', () => {
    expect(typeof service.onModuleDestroy).toBe('function');
  });

  it('should have tenant model accessor', () => {
    expect(service.tenant).toBeDefined();
  });

  it('should have dashboard model accessor', () => {
    expect(service.dashboard).toBeDefined();
  });

  it('should have widget model accessor', () => {
    expect(service.widget).toBeDefined();
  });

  it('should have dataSource model accessor', () => {
    expect(service.dataSource).toBeDefined();
  });

  it('should have syncRun model accessor', () => {
    expect(service.syncRun).toBeDefined();
  });

  it('should have dataPoint model accessor', () => {
    expect(service.dataPoint).toBeDefined();
  });
});
