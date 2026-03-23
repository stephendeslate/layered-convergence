// TRACED: EM-SEED-001
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@escrow-marketplace/shared';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Marketplace Alpha',
      slug: 'marketplace-alpha',
    },
  });

  // Create users
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      passwordHash,
      name: 'Alice Buyer',
      role: 'BUYER',
      tenantId: tenant.id,
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      passwordHash,
      name: 'Bob Seller',
      role: 'SELLER',
      tenantId: tenant.id,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  // Create listings (active and cancelled)
  const activeListing = await prisma.listing.create({
    data: {
      title: 'Vintage Watch',
      description: 'A beautiful vintage timepiece in excellent condition',
      price: 1500.00,
      status: 'ACTIVE',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const cancelledListing = await prisma.listing.create({
    data: {
      title: 'Cancelled Item',
      description: 'This listing was cancelled by the seller',
      price: 250.00,
      status: 'CANCELLED',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  // Create transactions (completed and disputed/error states)
  const completedTransaction = await prisma.transaction.create({
    data: {
      amount: 1500.00,
      status: 'COMPLETED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: activeListing.id,
      tenantId: tenant.id,
    },
  });

  const disputedTransaction = await prisma.transaction.create({
    data: {
      amount: 1500.00,
      status: 'DISPUTED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: activeListing.id,
      tenantId: tenant.id,
    },
  });

  // Create escrows (released and disputed/error states)
  await prisma.escrow.create({
    data: {
      amount: 1500.00,
      balance: 0.00,
      status: 'RELEASED',
      transactionId: completedTransaction.id,
      tenantId: tenant.id,
    },
  });

  await prisma.escrow.create({
    data: {
      amount: 1500.00,
      balance: 1500.00,
      status: 'DISPUTED',
      transactionId: disputedTransaction.id,
      tenantId: tenant.id,
    },
  });

  // Create disputes (open and escalated/error states)
  await prisma.dispute.create({
    data: {
      reason: 'Item not as described',
      status: 'OPEN',
      transactionId: disputedTransaction.id,
      raisedById: buyer.id,
      tenantId: tenant.id,
    },
  });

  await prisma.dispute.create({
    data: {
      reason: 'Seller unresponsive',
      status: 'ESCALATED',
      transactionId: disputedTransaction.id,
      raisedById: buyer.id,
      tenantId: tenant.id,
    },
  });

  // Suppress unused variable warnings
  void admin;
  void cancelledListing;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
