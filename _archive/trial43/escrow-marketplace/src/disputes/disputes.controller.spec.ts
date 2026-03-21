import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';

describe('DisputesController', () => {
  let controller: DisputesController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      resolve: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisputesController],
      providers: [
        { provide: DisputesService, useValue: service },
        Reflector,
      ],
    }).compile();

    controller = module.get<DisputesController>(DisputesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create dispute with user id from request', async () => {
      const dto = { transactionId: 'txn-1', reason: 'Bad service' };
      const req = { user: { id: 'user-1' } };
      service.create.mockResolvedValue({ id: 'dispute-1' });

      await controller.create(req, dto);
      expect(service.create).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('findAll', () => {
    it('should return all disputes', async () => {
      service.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return dispute by id', async () => {
      service.findById.mockResolvedValue({ id: 'dispute-1' });
      const result = await controller.findById('dispute-1');
      expect(result).toHaveProperty('id', 'dispute-1');
    });
  });

  describe('resolve', () => {
    it('should resolve dispute with admin id', async () => {
      const dto = { resolution: 'RESOLVED_BUYER' as const, reason: 'Valid claim' };
      const req = { user: { id: 'admin-1' } };
      service.resolve.mockResolvedValue({ id: 'dispute-1' });

      await controller.resolve('dispute-1', dto, req);
      expect(service.resolve).toHaveBeenCalledWith('dispute-1', dto, 'admin-1');
    });
  });
});
