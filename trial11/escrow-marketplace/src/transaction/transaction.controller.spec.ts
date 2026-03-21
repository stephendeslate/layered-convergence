import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller.js';
import { TransactionService } from './transaction.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRole, TransactionStatus } from '../../generated/prisma/client.js';

const mockUser = { id: 'user-1', email: 'test@test.com', name: 'Test', role: UserRole.BUYER, passwordHash: '', createdAt: new Date(), updatedAt: new Date() };

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      fund: vi.fn(),
      deliver: vi.fn(),
      release: vi.fn(),
      dispute: vi.fn(),
      refund: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: TransactionService, useValue: service },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should create a transaction', async () => {
    const dto = { providerId: 'p-1', amount: 100 };
    service.create.mockResolvedValue({ id: 'tx-1', status: TransactionStatus.PENDING });
    const result = await controller.create(dto, mockUser);
    expect(result.id).toBe('tx-1');
    expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
  });

  it('should list transactions', async () => {
    service.findAll.mockResolvedValue([]);
    const result = await controller.findAll(mockUser);
    expect(result).toEqual([]);
  });

  it('should get a single transaction', async () => {
    service.findOne.mockResolvedValue({ id: 'tx-1' });
    const result = await controller.findOne('tx-1');
    expect(result.id).toBe('tx-1');
  });

  it('should fund a transaction', async () => {
    service.fund.mockResolvedValue({ id: 'tx-1', status: TransactionStatus.FUNDED });
    const result = await controller.fund('tx-1', mockUser);
    expect(result.status).toBe(TransactionStatus.FUNDED);
  });

  it('should deliver a transaction', async () => {
    service.deliver.mockResolvedValue({ id: 'tx-1', status: TransactionStatus.DELIVERED });
    const result = await controller.deliver('tx-1', mockUser);
    expect(result.status).toBe(TransactionStatus.DELIVERED);
  });

  it('should release a transaction', async () => {
    service.release.mockResolvedValue({ id: 'tx-1', status: TransactionStatus.RELEASED });
    const result = await controller.release('tx-1', mockUser);
    expect(result.status).toBe(TransactionStatus.RELEASED);
  });

  it('should dispute a transaction', async () => {
    service.dispute.mockResolvedValue({ id: 'tx-1', status: TransactionStatus.DISPUTED });
    const result = await controller.dispute('tx-1', { reason: 'Bad' }, mockUser);
    expect(result.status).toBe(TransactionStatus.DISPUTED);
  });

  it('should refund a transaction', async () => {
    service.refund.mockResolvedValue({ id: 'tx-1', status: TransactionStatus.REFUNDED });
    const result = await controller.refund('tx-1', mockUser);
    expect(result.status).toBe(TransactionStatus.REFUNDED);
  });
});
