import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { DisputeController } from './dispute.controller';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';

describe('DisputeController', () => {
  let controller: DisputeController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      resolve: vi.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [DisputeController],
      providers: [
        { provide: DisputeService, useValue: service },
        { provide: PrismaService, useValue: {} },
        { provide: Reflector, useValue: new Reflector() },
      ],
    }).compile();

    controller = module.get(DisputeController);
  });

  it('should call create with user id and dto', async () => {
    const user = { id: 'u1' };
    service.create.mockResolvedValue({ id: 'd1' });

    await controller.create(user, { transactionId: 't1', reason: 'Bad product received' });
    expect(service.create).toHaveBeenCalledWith('u1', {
      transactionId: 't1',
      reason: 'Bad product received',
    });
  });

  it('should call findAll', async () => {
    service.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should call findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'd1' });
    const result = await controller.findOne('d1');
    expect(result.id).toBe('d1');
  });

  it('should call resolve with id and resolution', async () => {
    service.resolve.mockResolvedValue({ id: 'd1', resolved: true });
    await controller.resolve('d1', { resolution: 'REFUNDED' as any });
    expect(service.resolve).toHaveBeenCalledWith('d1', 'REFUNDED');
  });
});
