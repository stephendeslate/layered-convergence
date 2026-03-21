import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StripeAccountController } from './stripe-account.controller';
import { StripeAccountService } from './stripe-account.service';
import { Role } from '@prisma/client';
import { JwtPayload } from '../auth/auth.service';

describe('StripeAccountController', () => {
  let controller: StripeAccountController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findByUser: ReturnType<typeof vi.fn>;
    findByStripeId: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const sellerUser: JwtPayload = { sub: 'seller-1', email: 'seller@test.com', role: Role.SELLER };
  const adminUser: JwtPayload = { sub: 'admin-1', email: 'admin@test.com', role: Role.ADMIN };
  const mockAccount = { id: 'sa-1', userId: 'seller-1', stripeAccountId: 'acct_123' };

  beforeEach(() => {
    service = {
      create: vi.fn().mockResolvedValue(mockAccount),
      findByUser: vi.fn().mockResolvedValue(mockAccount),
      findByStripeId: vi.fn().mockResolvedValue(mockAccount),
      update: vi.fn().mockResolvedValue(mockAccount),
      delete: vi.fn().mockResolvedValue(mockAccount),
    };
    controller = new StripeAccountController(service as unknown as StripeAccountService);
  });

  it('should create a stripe account', async () => {
    const result = await controller.create({ stripeAccountId: 'acct_123' }, sellerUser);
    expect(service.create).toHaveBeenCalledWith({ stripeAccountId: 'acct_123' }, sellerUser);
    expect(result).toEqual(mockAccount);
  });

  it('should find by user', async () => {
    const result = await controller.findByUser('seller-1', sellerUser);
    expect(service.findByUser).toHaveBeenCalledWith('seller-1', sellerUser);
    expect(result).toEqual(mockAccount);
  });

  it('should find by stripe id', async () => {
    const result = await controller.findByStripeId('acct_123');
    expect(service.findByStripeId).toHaveBeenCalledWith('acct_123');
    expect(result).toEqual(mockAccount);
  });

  it('should update stripe account', async () => {
    const result = await controller.update('seller-1', { chargesEnabled: true }, adminUser);
    expect(service.update).toHaveBeenCalledWith('seller-1', { chargesEnabled: true }, adminUser);
    expect(result).toEqual(mockAccount);
  });

  it('should delete stripe account', async () => {
    const result = await controller.delete('seller-1', sellerUser);
    expect(service.delete).toHaveBeenCalledWith('seller-1', sellerUser);
    expect(result).toEqual(mockAccount);
  });
});
