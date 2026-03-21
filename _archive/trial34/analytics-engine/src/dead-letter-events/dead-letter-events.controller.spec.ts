import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { DeadLetterEventsController } from './dead-letter-events.controller';
import { DeadLetterEventsService } from './dead-letter-events.service';

describe('DeadLetterEventsController', () => {
  let controller: DeadLetterEventsController;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'dle-1' }),
      create: vi.fn().mockResolvedValue({ id: 'dle-1' }),
      markRetried: vi.fn().mockResolvedValue({ id: 'dle-1', retriedAt: new Date() }),
      remove: vi.fn().mockResolvedValue({ id: 'dle-1' }),
    };

    const module = await Test.createTestingModule({
      controllers: [DeadLetterEventsController],
      providers: [{ provide: DeadLetterEventsService, useValue: service }],
    }).compile();

    controller = module.get<DeadLetterEventsController>(DeadLetterEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should call service', async () => {
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('create should pass dto', async () => {
    const dto = { sourceType: 'api', errorReason: 'timeout' };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('markRetried should pass id', async () => {
    await controller.markRetried('dle-1');
    expect(service.markRetried).toHaveBeenCalledWith('dle-1');
  });

  it('remove should pass id', async () => {
    await controller.remove('dle-1');
    expect(service.remove).toHaveBeenCalledWith('dle-1');
  });
});
