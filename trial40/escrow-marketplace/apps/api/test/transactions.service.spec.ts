// TRACED: EM-TEST-003 — Transactions service unit tests with state machine
import { TransactionsService } from '../src/transactions/transactions.service';
import { TRANSACTION_STATUS_TRANSITIONS } from '@escrow-marketplace/shared';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let mockPrisma: Record<string, unknown>;

  beforeEach(() => {
    mockPrisma = {
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      escrowAccount: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      dispute: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(mockPrisma)),
    };
    service = new TransactionsService(mockPrisma as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should enforce valid state transitions', () => {
    expect(TRANSACTION_STATUS_TRANSITIONS.PENDING).toContain('COMPLETED');
    expect(TRANSACTION_STATUS_TRANSITIONS.PENDING).toContain('DISPUTED');
    expect(TRANSACTION_STATUS_TRANSITIONS.PENDING).toContain('FAILED');
    expect(TRANSACTION_STATUS_TRANSITIONS.COMPLETED).toEqual([]);
    expect(TRANSACTION_STATUS_TRANSITIONS.REFUNDED).toEqual([]);
    expect(TRANSACTION_STATUS_TRANSITIONS.FAILED).toEqual([]);
  });

  it('should reject invalid state transitions', async () => {
    (mockPrisma.transaction as Record<string, jest.Mock>).findFirst.mockResolvedValue({
      id: '1',
      status: 'COMPLETED',
      tenantId: 'tenant-1',
    });

    await expect(
      service.updateStatus('1', 'tenant-1', { status: 'PENDING' }),
    ).rejects.toThrow('Cannot transition from COMPLETED to PENDING');
  });

  it('should return paginated transactions', async () => {
    (mockPrisma.transaction as Record<string, jest.Mock>).findMany.mockResolvedValue([]);
    (mockPrisma.transaction as Record<string, jest.Mock>).count.mockResolvedValue(0);

    const result = await service.findAll('tenant-1', 1, 20);

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('should throw NotFoundException for missing transaction', async () => {
    (mockPrisma.transaction as Record<string, jest.Mock>).findFirst.mockResolvedValue(null);

    await expect(
      service.findOne('nonexistent', 'tenant-1'),
    ).rejects.toThrow('Transaction not found');
  });
});
