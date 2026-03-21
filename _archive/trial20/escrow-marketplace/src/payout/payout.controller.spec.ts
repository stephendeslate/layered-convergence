import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';

describe('PayoutController', () => {
  let controller: PayoutController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      findByUser: vi.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [PayoutController],
      providers: [
        { provide: PayoutService, useValue: service },
        { provide: PrismaService, useValue: {} },
        { provide: Reflector, useValue: new Reflector() },
      ],
    }).compile();

    controller = module.get(PayoutController);
  });

  it('should call create with body', async () => {
    const body = { transactionId: 't1', userId: 'u1', amount: 200 };
    service.create.mockResolvedValue({ id: 'p1' });

    await controller.create(body);
    expect(service.create).toHaveBeenCalledWith(body);
  });

  it('should call findAll', async () => {
    service.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should call findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'p1' });
    const result = await controller.findOne('p1');
    expect(result.id).toBe('p1');
  });

  it('should call findByUser', async () => {
    service.findByUser.mockResolvedValue([]);
    await controller.findByUser('u1');
    expect(service.findByUser).toHaveBeenCalledWith('u1');
  });
});
