// TRACED: EM-TESC-001
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EscrowsService } from '../src/escrows/escrows.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('EscrowsService', () => {
  let service: EscrowsService;
  let prisma: {
    escrow: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      escrow: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscrowsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EscrowsService>(EscrowsService);
  });

  describe('create', () => {
    it('should create an escrow', async () => {
      const mockEscrow = {
        id: '1',
        amount: 1000,
        balance: 1000,
        status: 'HELD',
        transactionId: 'tx-1',
        tenantId: 'tenant-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.escrow.create.mockResolvedValue(mockEscrow);

      const result = await service.create({
        amount: 1000,
        balance: 1000,
        transactionId: 'tx-1',
        tenantId: 'tenant-1',
      });
      expect(result.amount).toBe(1000);
    });
  });

  describe('findAll', () => {
    it('should return paginated escrows', async () => {
      prisma.escrow.findMany.mockResolvedValue([]);
      prisma.escrow.count.mockResolvedValue(0);

      const result = await service.findAll(1, 10);
      expect(result.data).toEqual([]);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an escrow by id', async () => {
      prisma.escrow.findFirst.mockResolvedValue({ id: '1', amount: 1000 });
      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException', async () => {
      prisma.escrow.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an escrow', async () => {
      prisma.escrow.findFirst.mockResolvedValue({ id: '1' });
      prisma.escrow.update.mockResolvedValue({ id: '1', status: 'RELEASED' });

      const result = await service.update('1', { status: 'RELEASED' });
      expect(result.status).toBe('RELEASED');
    });
  });

  describe('remove', () => {
    it('should delete an escrow', async () => {
      prisma.escrow.findFirst.mockResolvedValue({ id: '1' });
      prisma.escrow.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result.id).toBe('1');
    });
  });
});
