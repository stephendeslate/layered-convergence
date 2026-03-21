import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { Reflector } from '@nestjs/core';

describe('DisputesController', () => {
  let controller: DisputesController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      resolve: vi.fn(),
      submitEvidence: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisputesController],
      providers: [
        { provide: DisputesService, useValue: service },
        { provide: Reflector, useValue: { getAllAndOverride: vi.fn() } },
      ],
    }).compile();

    controller = module.get<DisputesController>(DisputesController);
  });

  it('should create dispute', async () => {
    const dto = { transactionId: 't1', reason: 'Bad service' };
    service.create.mockResolvedValue({ id: 'd1' });

    const result = await controller.create(dto, 'user-1', 'tenant-1');

    expect(service.create).toHaveBeenCalledWith('user-1', 'tenant-1', dto);
    expect(result).toEqual({ id: 'd1' });
  });

  it('should findAll disputes', async () => {
    service.findAll.mockResolvedValue([]);
    const result = await controller.findAll('t1');
    expect(result).toEqual([]);
  });

  it('should findOne dispute', async () => {
    service.findOne.mockResolvedValue({ id: 'd1' });
    const result = await controller.findOne('d1', 't1');
    expect(result).toEqual({ id: 'd1' });
  });

  it('should resolve dispute', async () => {
    const dto = { status: 'RESOLVED_BUYER' as any, resolution: 'Buyer wins' };
    service.resolve.mockResolvedValue({ id: 'd1', status: 'RESOLVED_BUYER' });

    const result = await controller.resolve('d1', dto, 'admin-1', 't1');

    expect(service.resolve).toHaveBeenCalledWith('d1', 't1', dto, 'admin-1');
    expect(result.status).toBe('RESOLVED_BUYER');
  });

  it('should submit evidence', async () => {
    service.submitEvidence.mockResolvedValue({ id: 'd1', evidence: 'proof' });

    const result = await controller.submitEvidence('d1', 'proof', 't1');

    expect(service.submitEvidence).toHaveBeenCalledWith('d1', 't1', 'proof');
  });
});
