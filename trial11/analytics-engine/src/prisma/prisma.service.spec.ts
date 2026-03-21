import { PrismaService } from './prisma.service.js';

vi.mock('../../generated/prisma/client.js', () => {
  return {
    PrismaClient: class MockPrismaClient {
      $connect = vi.fn();
      $disconnect = vi.fn();
    },
    Prisma: {
      sql: vi.fn(),
    },
  };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have $connect method from PrismaClient', () => {
    expect(service.$connect).toBeDefined();
  });

  it('should have $disconnect method from PrismaClient', () => {
    expect(service.$disconnect).toBeDefined();
  });

  it('should implement onModuleInit that calls $connect', async () => {
    expect(typeof service.onModuleInit).toBe('function');
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should implement onModuleDestroy that calls $disconnect', async () => {
    expect(typeof service.onModuleDestroy).toBe('function');
    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalled();
  });
});
