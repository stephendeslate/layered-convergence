import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let service: any;

  beforeEach(async () => {
    service = {
      createEndpoint: vi.fn(),
      findEndpoints: vi.fn(),
      findEndpointById: vi.fn(),
      deleteEndpoint: vi.fn(),
      findEvents: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        { provide: WebhooksService, useValue: service },
        Reflector,
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEndpoint', () => {
    it('should create endpoint with user id', async () => {
      const dto = { url: 'https://example.com/hook', events: ['transaction.updated'] };
      const req = { user: { id: 'user-1' } };
      service.createEndpoint.mockResolvedValue({ id: 'ep-1' });

      await controller.createEndpoint(req, dto);
      expect(service.createEndpoint).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('findEndpoints', () => {
    it('should return endpoints for user', async () => {
      const req = { user: { id: 'user-1' } };
      service.findEndpoints.mockResolvedValue([]);

      const result = await controller.findEndpoints(req);
      expect(service.findEndpoints).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findEndpointById', () => {
    it('should return endpoint by id', async () => {
      service.findEndpointById.mockResolvedValue({ id: 'ep-1' });

      const result = await controller.findEndpointById('ep-1');
      expect(result).toHaveProperty('id', 'ep-1');
    });
  });

  describe('deleteEndpoint', () => {
    it('should delete endpoint', async () => {
      service.deleteEndpoint.mockResolvedValue(undefined);

      await controller.deleteEndpoint('ep-1');
      expect(service.deleteEndpoint).toHaveBeenCalledWith('ep-1');
    });
  });

  describe('findEvents', () => {
    it('should return events for endpoint', async () => {
      service.findEvents.mockResolvedValue([]);

      const result = await controller.findEvents('ep-1');
      expect(result).toEqual([]);
    });
  });
});
