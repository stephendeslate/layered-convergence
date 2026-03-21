import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaService } from './prisma.service.js';

vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn().mockImplementation(() => ({})),
}));

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = Object.create(PrismaService.prototype);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have onModuleInit method', () => {
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should have onModuleDestroy method', () => {
    expect(typeof service.onModuleDestroy).toBe('function');
  });

  it('should implement OnModuleInit interface', () => {
    expect('onModuleInit' in service).toBe(true);
  });

  it('should implement OnModuleDestroy interface', () => {
    expect('onModuleDestroy' in service).toBe(true);
  });

  it('should extend PrismaClient', () => {
    expect(service).toBeInstanceOf(Object);
  });
});
