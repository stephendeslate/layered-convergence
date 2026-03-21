import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { QueryCacheController } from './query-cache.controller';
import { QueryCacheService } from './query-cache.service';

describe('QueryCacheController', () => {
  let controller: QueryCacheController;
  let service: any;

  beforeEach(async () => {
    service = {
      get: vi.fn().mockResolvedValue({ data: 'cached' }),
      invalidate: vi.fn().mockResolvedValue({ count: 1 }),
      purgeExpired: vi.fn().mockResolvedValue({ count: 5 }),
    };

    const module = await Test.createTestingModule({
      controllers: [QueryCacheController],
      providers: [{ provide: QueryCacheService, useValue: service }],
    }).compile();

    controller = module.get<QueryCacheController>(QueryCacheController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('get should pass queryHash', async () => {
    await controller.get('hash-1');
    expect(service.get).toHaveBeenCalledWith('hash-1');
  });

  it('invalidate should pass queryHash', async () => {
    await controller.invalidate('hash-1');
    expect(service.invalidate).toHaveBeenCalledWith('hash-1');
  });

  it('purge should call purgeExpired', async () => {
    await controller.purge();
    expect(service.purgeExpired).toHaveBeenCalled();
  });
});
