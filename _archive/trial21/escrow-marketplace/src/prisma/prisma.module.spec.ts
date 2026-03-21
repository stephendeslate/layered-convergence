import { describe, it, expect } from 'vitest';
import { PrismaModule } from './prisma.module';

describe('PrismaModule', () => {
  it('should be defined', () => {
    expect(PrismaModule).toBeDefined();
  });

  it('should have Global decorator metadata', () => {
    const metadata = Reflect.getMetadata('__module:global__', PrismaModule);
    expect(metadata).toBe(true);
  });
});
