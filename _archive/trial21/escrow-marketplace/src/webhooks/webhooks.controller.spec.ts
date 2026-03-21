import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let service: any;

  beforeEach(async () => {
    service = {
      processEvent: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      findByEventType: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [{ provide: WebhooksService, useValue: service }],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  it('should process stripe event', async () => {
    const dto = {
      eventType: 'payment_intent.succeeded',
      payload: {},
      idempotencyKey: 'evt_1',
    };
    service.processEvent.mockResolvedValue({ id: 'w1' });

    const result = await controller.processStripeEvent(dto);

    expect(service.processEvent).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'w1' });
  });

  it('should findAll', async () => {
    service.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should findAll with tenantId', async () => {
    service.findAll.mockResolvedValue([]);
    await controller.findAll('t1');
    expect(service.findAll).toHaveBeenCalledWith('t1');
  });

  it('should findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'w1' });
    const result = await controller.findOne('w1');
    expect(result).toEqual({ id: 'w1' });
  });

  it('should findByEventType', async () => {
    service.findByEventType.mockResolvedValue([]);
    const result = await controller.findByEventType('payment_intent.succeeded');
    expect(result).toEqual([]);
  });
});
