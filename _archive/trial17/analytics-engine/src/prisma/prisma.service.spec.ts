import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(() => ({
    end: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@prisma/client', () => {
  const actual = {
    PrismaClient: class MockPrismaClient {
      $connect = vi.fn().mockResolvedValue(undefined);
      $disconnect = vi.fn().mockResolvedValue(undefined);
      constructor(_opts?: unknown) {}
    },
    Prisma: {
      sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
        strings,
        values,
      }),
      PrismaClientKnownRequestError: class extends Error {
        code: string;
        constructor(msg: string, opts: { code: string; clientVersion: string }) {
          super(msg);
          this.code = opts.code;
        }
      },
    },
    PipelineStatus: {
      IDLE: 'IDLE',
      RUNNING: 'RUNNING',
      COMPLETED: 'COMPLETED',
      FAILED: 'FAILED',
    },
  };
  return actual;
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect on module init', async () => {
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should disconnect on module destroy', async () => {
    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalled();
  });
});
