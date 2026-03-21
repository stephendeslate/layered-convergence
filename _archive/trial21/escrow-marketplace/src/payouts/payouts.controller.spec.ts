import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import { Reflector } from '@nestjs/core';

describe('PayoutsController', () => {
  let controller: PayoutsController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      findByUser: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayoutsController],
      providers: [
        { provide: PayoutsService, useValue: service },
        { provide: Reflector, useValue: { getAllAndOverride: vi.fn() } },
      ],
    }).compile();

    controller = module.get<PayoutsController>(PayoutsController);
  });

  it('should create payout', async () => {
    const dto = { transactionId: 't1', amount: 900 };
    service.create.mockResolvedValue({ id: 'pay1' });

    const result = await controller.create(dto, 'user-1', 'tenant-1');

    expect(service.create).toHaveBeenCalledWith('user-1', 'tenant-1', dto);
    expect(result).toEqual({ id: 'pay1' });
  });

  it('should findAll payouts', async () => {
    service.findAll.mockResolvedValue([]);
    const result = await controller.findAll('t1');
    expect(result).toEqual([]);
  });

  it('should findOne payout', async () => {
    service.findOne.mockResolvedValue({ id: 'pay1' });
    const result = await controller.findOne('pay1', 't1');
    expect(result).toEqual({ id: 'pay1' });
  });

  it('should findByUser', async () => {
    service.findByUser.mockResolvedValue([]);
    const result = await controller.findByUser('u1', 't1');
    expect(result).toEqual([]);
  });
});
