import { describe, it, expect, beforeEach } from 'vitest';
import { DeadLetterEventService } from './dead-letter-event.service';

function createMockPrisma() {
  return {
    deadLetterEvent: {
      create: async (args: any) => ({ id: 'dle-1', ...args.data }),
      findMany: async () => [{ id: 'dle-1', errorReason: 'Parse error' }],
      findUniqueOrThrow: async () => ({ id: 'dle-1', errorReason: 'Parse error' }),
      update: async (args: any) => ({ id: args.where.id, ...args.data }),
      delete: async (args: any) => ({ id: args.where.id }),
      deleteMany: async () => ({ count: 3 }),
    },
  } as any;
}

describe('DeadLetterEventService', () => {
  let service: DeadLetterEventService;

  beforeEach(() => {
    service = new DeadLetterEventService(createMockPrisma());
  });

  it('should create a dead letter event', async () => {
    const result = await service.create({
      dataSourceId: 'ds-1',
      errorReason: 'Invalid payload',
      payload: { bad: 'data' },
    });
    expect(result.errorReason).toBe('Invalid payload');
  });

  it('should find all dead letter events', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should find dead letter events by data source', async () => {
    const result = await service.findAll('ds-1');
    expect(result).toBeDefined();
  });

  it('should find one dead letter event', async () => {
    const result = await service.findOne('dle-1');
    expect(result.id).toBe('dle-1');
  });

  it('should retry a dead letter event', async () => {
    const result = await service.retry('dle-1');
    expect(result.retriedAt).toBeDefined();
  });

  it('should delete a dead letter event', async () => {
    const result = await service.remove('dle-1');
    expect(result.id).toBe('dle-1');
  });

  it('should delete all dead letter events for a data source', async () => {
    const result = await service.removeAll('ds-1');
    expect(result.count).toBe(3);
  });
});
