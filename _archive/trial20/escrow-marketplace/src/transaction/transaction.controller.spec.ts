import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      findByUser: vi.fn(),
      transition: vi.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: TransactionService, useValue: service },
        { provide: PrismaService, useValue: {} },
        { provide: Reflector, useValue: new Reflector() },
      ],
    }).compile();

    controller = module.get(TransactionController);
  });

  it('should call create with user id and dto', async () => {
    const user = { id: 'u1' };
    const dto = { amount: 100, providerId: 'p1' };
    service.create.mockResolvedValue({ id: 't1' });

    const result = await controller.create(user, dto);
    expect(service.create).toHaveBeenCalledWith('u1', dto);
    expect(result.id).toBe('t1');
  });

  it('should call findAll', async () => {
    service.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should call findOne with id', async () => {
    service.findOne.mockResolvedValue({ id: 't1' });
    const result = await controller.findOne('t1');
    expect(result.id).toBe('t1');
  });

  it('should call findByUser with userId', async () => {
    service.findByUser.mockResolvedValue([]);
    await controller.findByUser('u1');
    expect(service.findByUser).toHaveBeenCalledWith('u1');
  });

  it('should call transition with id and status', async () => {
    service.transition.mockResolvedValue({ id: 't1', status: 'FUNDED' });
    const result = await controller.transition('t1', { status: 'FUNDED' as any });
    expect(service.transition).toHaveBeenCalledWith('t1', 'FUNDED');
  });
});
