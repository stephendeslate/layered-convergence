import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';

describe('PayoutsController', () => {
  let controller: PayoutsController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayoutsController],
      providers: [
        { provide: PayoutsService, useValue: service },
        Reflector,
      ],
    }).compile();

    controller = module.get<PayoutsController>(PayoutsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create payout with provider id from request', async () => {
      const dto = { transactionId: 'txn-1', amount: 95 };
      const req = { user: { id: 'provider-1', role: 'PROVIDER' } };
      service.create.mockResolvedValue({ id: 'payout-1' });

      await controller.create(req, dto);
      expect(service.create).toHaveBeenCalledWith('provider-1', dto);
    });
  });

  describe('findAll', () => {
    it('should pass user id and role', async () => {
      const req = { user: { id: 'prov-1', role: 'PROVIDER' } };
      service.findAll.mockResolvedValue([]);

      await controller.findAll(req);
      expect(service.findAll).toHaveBeenCalledWith('prov-1', 'PROVIDER');
    });
  });

  describe('findById', () => {
    it('should return payout by id', async () => {
      service.findById.mockResolvedValue({ id: 'payout-1' });
      const result = await controller.findById('payout-1');
      expect(result).toHaveProperty('id', 'payout-1');
    });
  });

  describe('process', () => {
    it('should update status to PROCESSING', async () => {
      service.updateStatus.mockResolvedValue({ status: 'PROCESSING' });
      await controller.process('payout-1');
      expect(service.updateStatus).toHaveBeenCalledWith('payout-1', 'PROCESSING');
    });
  });

  describe('complete', () => {
    it('should update status to COMPLETED', async () => {
      service.updateStatus.mockResolvedValue({ status: 'COMPLETED' });
      await controller.complete('payout-1');
      expect(service.updateStatus).toHaveBeenCalledWith('payout-1', 'COMPLETED');
    });
  });
});
