import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EscrowService } from '../escrow.service';
import { PrismaService } from '../../prisma.service';

// TRACED: EM-TST-ESC-001 — Escrow service unit tests
describe('EscrowService', () => {
  let service: EscrowService;
  let prisma: {
    escrowTransaction: { findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    setTenantContext: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      escrowTransaction: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscrowService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EscrowService>(EscrowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated transactions', async () => {
    prisma.escrowTransaction.findMany.mockResolvedValue([
      { id: '1', status: 'CREATED', disputes: [] },
    ]);
    const result = await service.findAll('tenant-1', 1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.totalPages).toBe(1);
  });

  it('should throw NotFoundException when transaction not found', async () => {
    prisma.escrowTransaction.findFirst.mockResolvedValue(null);
    await expect(service.findOne('x', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('should reject invalid state transition', async () => {
    prisma.escrowTransaction.findFirst.mockResolvedValue({ id: '1', status: 'RELEASED' });
    await expect(
      service.transition('1', 'FUNDED', 'tenant-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow CREATED -> FUNDED transition', async () => {
    prisma.escrowTransaction.findFirst.mockResolvedValue({ id: '1', status: 'CREATED' });
    prisma.escrowTransaction.update.mockResolvedValue({ id: '1', status: 'FUNDED' });
    const result = await service.transition('1', 'FUNDED', 'tenant-1');
    expect(result.status).toBe('FUNDED');
  });
});
