import { describe, it, expect } from 'vitest';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

describe('PrismaService', () => {
  it('should extend PrismaClient with $connect', () => {
    expect(PrismaService.prototype).toHaveProperty('$connect');
  });

  it('should extend PrismaClient with $disconnect', () => {
    expect(PrismaService.prototype).toHaveProperty('$disconnect');
  });

  it('should have onModuleInit method', () => {
    expect(typeof PrismaService.prototype.onModuleInit).toBe('function');
  });

  it('should have onModuleDestroy method', () => {
    expect(typeof PrismaService.prototype.onModuleDestroy).toBe('function');
  });

  it('should have setOrgContext method', () => {
    expect(typeof PrismaService.prototype.setOrgContext).toBe('function');
  });

  it('should be a subclass of PrismaClient', () => {
    expect(PrismaService.prototype).toBeInstanceOf(PrismaClient);
  });

  it('should implement OnModuleInit interface', () => {
    const proto = PrismaService.prototype;
    expect('onModuleInit' in proto).toBe(true);
  });
});
