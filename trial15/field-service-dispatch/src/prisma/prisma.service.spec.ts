import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be an instance of PrismaService', () => {
    expect(service).toBeInstanceOf(PrismaService);
  });

  it('should have onModuleInit method', () => {
    expect(service.onModuleInit).toBeDefined();
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should have onModuleDestroy method', () => {
    expect(service.onModuleDestroy).toBeDefined();
    expect(typeof service.onModuleDestroy).toBe('function');
  });

  it('should have cleanDatabase method', () => {
    expect(service.cleanDatabase).toBeDefined();
    expect(typeof service.cleanDatabase).toBe('function');
  });

  it('should have $connect method from PrismaClient', () => {
    expect(service.$connect).toBeDefined();
  });

  it('should have $disconnect method from PrismaClient', () => {
    expect(service.$disconnect).toBeDefined();
  });

  it('should connect on module init', async () => {
    const connectSpy = vi.spyOn(service, '$connect').mockResolvedValue();
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalled();
  });

  it('should disconnect on module destroy', async () => {
    const disconnectSpy = vi.spyOn(service, '$disconnect').mockResolvedValue();
    await service.onModuleDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should expose Prisma model accessors', () => {
    expect(service.company).toBeDefined();
    expect(service.user).toBeDefined();
    expect(service.technician).toBeDefined();
    expect(service.customer).toBeDefined();
    expect(service.workOrder).toBeDefined();
    expect(service.route).toBeDefined();
    expect(service.invoice).toBeDefined();
    expect(service.gpsEvent).toBeDefined();
  });
});
