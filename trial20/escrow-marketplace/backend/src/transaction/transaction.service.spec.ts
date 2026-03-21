import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TransactionStatus, Role } from '@prisma/client';

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: {
    transaction: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    setRlsContext: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      setRlsContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  describe('create', () => {
    it('should create a transaction for a buyer', async () => {
      const dto = { sellerId: 'seller-1', amount: 100.50, description: 'Test' };
      const expected = { id: 'tx-1', ...dto, buyerId: 'buyer-1', status: 'PENDING' };
      prisma.transaction.create.mockResolvedValue(expected);

      const result = await service.create('buyer-1', Role.BUYER, dto);
      expect(result).toEqual(expected);
      expect(prisma.setRlsContext).toHaveBeenCalledWith('buyer-1');
    });

    it('should reject non-buyers from creating transactions', async () => {
      await expect(
        service.create('seller-1', Role.SELLER, {
          sellerId: 'seller-2',
          amount: 100,
          description: 'Test',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return user transactions', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);
      const result = await service.findAll('user-1');
      expect(result).toEqual([]);
      expect(prisma.setRlsContext).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when transaction not found', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);
      await expect(service.findOne('user-1', 'tx-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        buyerId: 'other-user',
        sellerId: 'another-user',
      });
      await expect(service.findOne('user-1', 'tx-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should update status with valid transition', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        status: TransactionStatus.PENDING,
      });
      prisma.transaction.update.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.FUNDED,
      });

      const result = await service.updateStatus('buyer-1', Role.BUYER, 'tx-1', {
        status: TransactionStatus.FUNDED,
      });
      expect(result.status).toBe(TransactionStatus.FUNDED);
    });

    it('should reject invalid state transitions', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        status: TransactionStatus.PENDING,
      });

      await expect(
        service.updateStatus('buyer-1', Role.BUYER, 'tx-1', {
          status: TransactionStatus.SHIPPED,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
