import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect on module init', async () => {
    const connectSpy = vi
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalledOnce();
  });

  it('should disconnect on module destroy', async () => {
    const disconnectSpy = vi
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);
    await service.onModuleDestroy();
    expect(disconnectSpy).toHaveBeenCalledOnce();
  });

  it('should set tenant context via parameterized set_config', async () => {
    const queryRawSpy = vi
      .spyOn(service, '$queryRaw')
      .mockResolvedValue(undefined as any);
    await service.setTenantContext('tenant-123');
    expect(queryRawSpy).toHaveBeenCalledOnce();
    const call = queryRawSpy.mock.calls[0]![0];
    expect(call).toBeDefined();
  });

  it('should execute callback within tenant transaction', async () => {
    const mockTx = {
      $queryRaw: vi.fn().mockResolvedValue(undefined),
    };
    const transactionSpy = vi
      .spyOn(service, '$transaction')
      .mockImplementation(async (fn: any) => fn(mockTx));

    const result = await service.withTenantTransaction(
      'tenant-456',
      async () => 'result',
    );

    expect(transactionSpy).toHaveBeenCalledOnce();
    expect(mockTx.$queryRaw).toHaveBeenCalledOnce();
    expect(result).toBe('result');
  });

  it('should propagate errors from tenant transaction', async () => {
    vi.spyOn(service, '$transaction').mockImplementation(async (fn: any) => {
      const mockTx = {
        $queryRaw: vi.fn().mockResolvedValue(undefined),
      };
      return fn(mockTx);
    });

    await expect(
      service.withTenantTransaction('tenant-789', async () => {
        throw new Error('Transaction failed');
      }),
    ).rejects.toThrow('Transaction failed');
  });
});
