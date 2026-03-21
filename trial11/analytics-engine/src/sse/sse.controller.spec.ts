import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom } from 'rxjs';
import { SseController } from './sse.controller.js';
import { SseService } from './sse.service.js';

describe('SseController', () => {
  let controller: SseController;
  let sseService: SseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SseController],
      providers: [SseService],
    }).compile();

    controller = module.get<SseController>(SseController);
    sseService = module.get<SseService>(SseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('streamDashboardUpdates', () => {
    it('should return an observable with retry field', async () => {
      const observable = controller.streamDashboardUpdates('dash-1');
      const eventPromise = firstValueFrom(observable);

      sseService.pushUpdate('dash-1', { test: true });

      const event = await eventPromise;
      expect(event.retry).toBe(10000);
      expect(event.data).toBeDefined();
    });
  });
});
