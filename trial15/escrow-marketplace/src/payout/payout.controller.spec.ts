import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutController } from './payout.controller';
import { PayoutService } from './payout.service';
import { Role } from '@prisma/client';
import { JwtPayload } from '../auth/auth.service';

describe('PayoutController', () => {
  let controller: PayoutController;
  let service: {
    createPayout: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  const sellerUser: JwtPayload = { sub: 'seller-1', email: 'seller@test.com', role: Role.SELLER };
  const mockPayout = { id: 'payout-1', transactionId: 'txn-1', userId: 'seller-1', amount: 100 };

  beforeEach(() => {
    service = {
      createPayout: vi.fn().mockResolvedValue(mockPayout),
      findAll: vi.fn().mockResolvedValue([mockPayout]),
      findOne: vi.fn().mockResolvedValue(mockPayout),
    };
    controller = new PayoutController(service as unknown as PayoutService);
  });

  it('should create a payout', async () => {
    const result = await controller.createPayout('txn-1', sellerUser);
    expect(service.createPayout).toHaveBeenCalledWith('txn-1', sellerUser);
    expect(result).toEqual(mockPayout);
  });

  it('should find all payouts', async () => {
    const result = await controller.findAll(sellerUser);
    expect(service.findAll).toHaveBeenCalledWith(sellerUser);
    expect(result).toEqual([mockPayout]);
  });

  it('should find one payout', async () => {
    const result = await controller.findOne('payout-1', sellerUser);
    expect(service.findOne).toHaveBeenCalledWith('payout-1', sellerUser);
    expect(result).toEqual(mockPayout);
  });
});
