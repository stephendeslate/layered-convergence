import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

describe('WebhookController', () => {
  let controller: WebhookController;
  let service: any;

  beforeEach(async () => {
    service = {
      process: vi.fn(),
      findAll: vi.fn(),
      findByKey: vi.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [{ provide: WebhookService, useValue: service }],
    }).compile();

    controller = module.get(WebhookController);
  });

  it('should call process with body', async () => {
    const body = { idempotencyKey: 'k1', event: 'test', payload: {} };
    service.process.mockResolvedValue({ id: 'w1' });

    await controller.process(body);
    expect(service.process).toHaveBeenCalledWith(body);
  });

  it('should call findAll', async () => {
    service.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should call findByKey', async () => {
    service.findByKey.mockResolvedValue({ idempotencyKey: 'k1' });
    const result = await controller.findByKey('k1');
    expect(result.idempotencyKey).toBe('k1');
  });
});
