import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service.js';

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

  it('should expose Prisma model delegates', () => {
    expect(service.company).toBeDefined();
    expect(service.technician).toBeDefined();
    expect(service.workOrder).toBeDefined();
  });

  it('should have $connect method', () => {
    expect(typeof service.$connect).toBe('function');
  });

  it('should have $disconnect method', () => {
    expect(typeof service.$disconnect).toBe('function');
  });

  it('should expose customer model delegate', () => {
    expect(service.customer).toBeDefined();
  });

  it('should expose route model delegate', () => {
    expect(service.route).toBeDefined();
  });

  it('should expose invoice model delegate', () => {
    expect(service.invoice).toBeDefined();
  });

  it('should expose workOrderStatusHistory model delegate', () => {
    expect(service.workOrderStatusHistory).toBeDefined();
  });
});
