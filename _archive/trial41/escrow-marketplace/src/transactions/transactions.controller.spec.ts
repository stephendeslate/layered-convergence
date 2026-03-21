import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionStatus } from '@prisma/client';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
      getStatusHistory: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: service },
        Reflector,
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction with buyer id from request', async () => {
      const dto = { providerId: 'prov-1', amount: 100 };
      const req = { user: { id: 'buyer-1', role: 'BUYER' } };
      service.create.mockResolvedValue({ id: 'txn-1', ...dto });

      const result = await controller.create(req, dto);
      expect(service.create).toHaveBeenCalledWith('buyer-1', dto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should pass user id and role to service', async () => {
      const req = { user: { id: 'user-1', role: 'BUYER' } };
      service.findAll.mockResolvedValue([]);

      await controller.findAll(req);
      expect(service.findAll).toHaveBeenCalledWith('user-1', 'BUYER');
    });
  });

  describe('findById', () => {
    it('should return transaction by id', async () => {
      const txn = { id: 'txn-1' };
      service.findById.mockResolvedValue(txn);

      const result = await controller.findById('txn-1');
      expect(result).toEqual(txn);
    });
  });

  describe('updateStatus', () => {
    it('should call updateStatus with correct params', async () => {
      const dto = { status: TransactionStatus.PAYMENT_HELD, reason: 'test' };
      const req = { user: { id: 'user-1' } };
      service.updateStatus.mockResolvedValue({ id: 'txn-1', status: dto.status });

      await controller.updateStatus('txn-1', dto, req);
      expect(service.updateStatus).toHaveBeenCalledWith(
        'txn-1',
        TransactionStatus.PAYMENT_HELD,
        'test',
        'user-1',
      );
    });
  });

  describe('getStatusHistory', () => {
    it('should return status history', async () => {
      service.getStatusHistory.mockResolvedValue([]);

      const result = await controller.getStatusHistory('txn-1');
      expect(result).toEqual([]);
      expect(service.getStatusHistory).toHaveBeenCalledWith('txn-1');
    });
  });
});
