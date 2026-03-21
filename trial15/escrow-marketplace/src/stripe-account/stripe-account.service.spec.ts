import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StripeAccountService } from './stripe-account.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtPayload } from '../auth/auth.service';

describe('StripeAccountService', () => {
  let service: StripeAccountService;
  let prisma: {
    stripeAccount: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  const sellerUser: JwtPayload = { sub: 'seller-1', email: 'seller@test.com', role: Role.SELLER };
  const buyerUser: JwtPayload = { sub: 'buyer-1', email: 'buyer@test.com', role: Role.BUYER };
  const adminUser: JwtPayload = { sub: 'admin-1', email: 'admin@test.com', role: Role.ADMIN };

  const mockAccount = {
    id: 'sa-1',
    userId: 'seller-1',
    stripeAccountId: 'acct_123',
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
    user: { id: 'seller-1', name: 'Seller' },
  };

  beforeEach(() => {
    prisma = {
      stripeAccount: {
        create: vi.fn().mockResolvedValue(mockAccount),
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(mockAccount),
        update: vi.fn().mockResolvedValue({ ...mockAccount, chargesEnabled: true }),
        delete: vi.fn().mockResolvedValue(mockAccount),
      },
    };
    service = new StripeAccountService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a stripe account for seller', async () => {
      const result = await service.create({ stripeAccountId: 'acct_123' }, sellerUser);
      expect(result).toEqual(mockAccount);
    });

    it('should throw ForbiddenException for buyer', async () => {
      await expect(service.create({ stripeAccountId: 'acct_123' }, buyerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if account exists', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(mockAccount);
      await expect(service.create({ stripeAccountId: 'acct_123' }, sellerUser)).rejects.toThrow(ConflictException);
    });

    it('should allow admin to create stripe account', async () => {
      const result = await service.create({ stripeAccountId: 'acct_456' }, adminUser);
      expect(result).toEqual(mockAccount);
    });
  });

  describe('findByUser', () => {
    it('should find account for the requesting user', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(mockAccount);
      const result = await service.findByUser('seller-1', sellerUser);
      expect(result).toEqual(mockAccount);
    });

    it('should allow admin to find any account', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(mockAccount);
      const result = await service.findByUser('seller-1', adminUser);
      expect(result).toEqual(mockAccount);
    });

    it('should throw ForbiddenException for other users', async () => {
      await expect(service.findByUser('seller-1', buyerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(null);
      await expect(service.findByUser('seller-1', sellerUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStripeId', () => {
    it('should find by stripe account ID', async () => {
      const result = await service.findByStripeId('acct_123');
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.stripeAccount.findFirst.mockResolvedValue(null);
      await expect(service.findByStripeId('acct_999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update stripe account status as admin', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(mockAccount);
      const result = await service.update('seller-1', { chargesEnabled: true }, adminUser);
      expect(result.chargesEnabled).toBe(true);
    });

    it('should throw ForbiddenException for non-admin', async () => {
      await expect(service.update('seller-1', { chargesEnabled: true }, sellerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if account not found', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(null);
      await expect(service.update('seller-1', { chargesEnabled: true }, adminUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete own account', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(mockAccount);
      const result = await service.delete('seller-1', sellerUser);
      expect(result).toEqual(mockAccount);
    });

    it('should allow admin to delete any account', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(mockAccount);
      const result = await service.delete('seller-1', adminUser);
      expect(result).toEqual(mockAccount);
    });

    it('should throw ForbiddenException for other users', async () => {
      await expect(service.delete('seller-1', buyerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(null);
      await expect(service.delete('seller-1', sellerUser)).rejects.toThrow(NotFoundException);
    });
  });
});
