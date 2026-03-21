import { describe, it, expect } from 'vitest';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('should export PrismaService class', () => {
    expect(PrismaService).toBeDefined();
  });

  it('should be a constructor function', () => {
    expect(typeof PrismaService).toBe('function');
  });

  it('should have onModuleInit in prototype', () => {
    expect(typeof PrismaService.prototype.onModuleInit).toBe('function');
  });

  it('should have onModuleDestroy in prototype', () => {
    expect(typeof PrismaService.prototype.onModuleDestroy).toBe('function');
  });

  it('should extend PrismaClient', () => {
    const proto = Object.getPrototypeOf(PrismaService.prototype);
    expect(proto).toBeDefined();
    expect(proto.constructor).toBeDefined();
  });

  it('should implement OnModuleInit interface', () => {
    expect('onModuleInit' in PrismaService.prototype).toBe(true);
  });

  it('should implement OnModuleDestroy interface', () => {
    expect('onModuleDestroy' in PrismaService.prototype).toBe(true);
  });
});
