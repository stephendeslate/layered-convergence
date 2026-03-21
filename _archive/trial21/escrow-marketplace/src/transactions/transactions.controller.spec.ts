import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Reflector } from '@nestjs/core';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      transition: vi.fn(),
      findByBuyer: vi.fn(),
      findByProvider: vi.fn(),
      getAnalytics: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: service },
        { provide: Reflector, useValue: { getAllAndOverride: vi.fn() } },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should create transaction', async () => {
    const dto = { amount: 1000, providerId: 'p1' };
    service.create.mockResolvedValue({ id: '1' });

    const result = await controller.create(dto, 'user-1', 'tenant-1');

    expect(service.create).toHaveBeenCalledWith('user-1', 'tenant-1', dto);
    expect(result).toEqual({ id: '1' });
  });

  it('should findAll', async () => {
    service.findAll.mockResolvedValue([]);
    const result = await controller.findAll('t1');
    expect(result).toEqual([]);
  });

  it('should findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1', 't1');
    expect(result).toEqual({ id: '1' });
  });

  it('should transition', async () => {
    service.transition.mockResolvedValue({ id: '1', status: 'HELD' });
    const result = await controller.transition('1', { toStatus: 'HELD' as any }, 'user-1', 't1');
    expect(service.transition).toHaveBeenCalledWith('1', 't1', { toStatus: 'HELD' }, 'user-1');
    expect(result.status).toBe('HELD');
  });

  it('should findByBuyer', async () => {
    service.findByBuyer.mockResolvedValue([]);
    const result = await controller.findByBuyer('b1', 't1');
    expect(result).toEqual([]);
  });

  it('should findByProvider', async () => {
    service.findByProvider.mockResolvedValue([]);
    const result = await controller.findByProvider('p1', 't1');
    expect(result).toEqual([]);
  });

  it('should getAnalytics', async () => {
    service.getAnalytics.mockResolvedValue({ totalTransactions: 0 });
    const result = await controller.getAnalytics('t1');
    expect(result).toEqual({ totalTransactions: 0 });
  });
});
