import { describe, it, expect } from 'vitest';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

describe('PrismaService', () => {
  it('should extend PrismaClient', () => {
    expect(PrismaService.prototype).toBeInstanceOf(PrismaClient);
  });

  it('should implement onModuleInit', () => {
    expect(typeof PrismaService.prototype.onModuleInit).toBe('function');
  });

  it('should implement onModuleDestroy', () => {
    expect(typeof PrismaService.prototype.onModuleDestroy).toBe('function');
  });

  it('should have Injectable decorator metadata', () => {
    const metadata = Reflect.getMetadata('__injectable__', PrismaService);
    expect(metadata).toBe(true);
  });

  it('should be a class with the correct name', () => {
    expect(PrismaService.name).toBe('PrismaService');
  });
});
