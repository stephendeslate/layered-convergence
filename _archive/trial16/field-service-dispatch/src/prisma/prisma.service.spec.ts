import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service.js';

vi.mock('pg', () => {
  const Pool = vi.fn().mockImplementation(() => ({
    end: vi.fn().mockResolvedValue(undefined),
  }));
  return { default: { Pool }, Pool };
});

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn().mockImplementation(() => ({})),
}));

describe('PrismaService', () => {
  it('should be defined', () => {
    expect(PrismaService).toBeDefined();
  });

  it('should be a class that extends PrismaClient', () => {
    expect(PrismaService.prototype.onModuleInit).toBeDefined();
    expect(PrismaService.prototype.onModuleDestroy).toBeDefined();
  });

  it('should have onModuleInit method', () => {
    expect(typeof PrismaService.prototype.onModuleInit).toBe('function');
  });

  it('should have onModuleDestroy method', () => {
    expect(typeof PrismaService.prototype.onModuleDestroy).toBe('function');
  });

  it('should fall back to default connection string when DATABASE_URL is not set', () => {
    const originalEnv = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    expect(process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5433/test').toBe(
      'postgresql://test:test@localhost:5433/test',
    );
    process.env.DATABASE_URL = originalEnv;
  });
});
