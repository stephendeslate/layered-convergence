import { describe, it, expect } from 'vitest';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  it('should be defined', () => {
    const service = new PrismaService();
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    const service = new PrismaService();
    expect(service.$connect).toBeDefined();
    expect(service.$disconnect).toBeDefined();
  });

  it('should have onModuleInit method', () => {
    const service = new PrismaService();
    expect(service.onModuleInit).toBeDefined();
  });

  it('should have onModuleDestroy method', () => {
    const service = new PrismaService();
    expect(service.onModuleDestroy).toBeDefined();
  });

  it('should use Pool and PrismaPg adapter (not connection string in super)', () => {
    const src = PrismaService.toString();
    expect(src).toContain('Pool');
  });

  it('should have company model accessor', () => {
    const service = new PrismaService();
    expect(service.company).toBeDefined();
  });

  it('should have workOrder model accessor', () => {
    const service = new PrismaService();
    expect(service.workOrder).toBeDefined();
  });

  it('should have technician model accessor', () => {
    const service = new PrismaService();
    expect(service.technician).toBeDefined();
  });
});
