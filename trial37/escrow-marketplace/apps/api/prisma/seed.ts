import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@escrow-marketplace/shared';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: { name: 'Default Marketplace' },
  });

  const hashedPassword = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      balance: 0,
      tenantId: tenant.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      password: hashedPassword,
      name: 'Manager User',
      role: 'MANAGER',
      balance: 1000,
      tenantId: tenant.id,
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      password: hashedPassword,
      name: 'Seller User',
      role: 'SELLER',
      balance: 500,
      tenantId: tenant.id,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      password: hashedPassword,
      name: 'Buyer User',
      role: 'BUYER',
      balance: 2000,
      tenantId: tenant.id,
    },
  });

  const listing1 = await prisma.listing.create({
    data: {
      title: 'Vintage Watch',
      slug: 'vintage-watch',
      description: 'A beautiful vintage timepiece in excellent condition',
      price: 299.99,
      status: 'ACTIVE',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      title: 'Leather Bag',
      slug: 'leather-bag',
      description: 'Handcrafted genuine leather messenger bag',
      price: 149.50,
      status: 'ACTIVE',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      title: 'Art Print Collection',
      slug: 'art-print-collection',
      description: 'Set of 5 limited edition art prints',
      price: 75.00,
      status: 'SOLD',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      title: 'Cancelled Item',
      slug: 'cancelled-item',
      description: 'This listing was cancelled by the seller',
      price: 50.00,
      status: 'CANCELLED',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  // Completed transaction
  const tx1 = await prisma.transaction.create({
    data: {
      amount: 75.00,
      status: 'COMPLETED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing3.id,
      tenantId: tenant.id,
    },
  });

  await prisma.escrowAccount.create({
    data: {
      amount: 75.00,
      transactionId: tx1.id,
      tenantId: tenant.id,
    },
  });

  // Disputed transaction
  const tx2 = await prisma.transaction.create({
    data: {
      amount: 149.50,
      status: 'DISPUTED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing2.id,
      tenantId: tenant.id,
    },
  });

  await prisma.escrowAccount.create({
    data: {
      amount: 149.50,
      transactionId: tx2.id,
      tenantId: tenant.id,
    },
  });

  // Failed transaction
  const listing5 = await prisma.listing.create({
    data: {
      title: 'Failed Purchase Item',
      slug: 'failed-purchase-item',
      description: 'Transaction for this item failed during processing',
      price: 500.00,
      status: 'ACTIVE',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const tx3 = await prisma.transaction.create({
    data: {
      amount: 500.00,
      status: 'FAILED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing5.id,
      tenantId: tenant.id,
    },
  });

  await prisma.escrowAccount.create({
    data: {
      amount: 500.00,
      transactionId: tx3.id,
      tenantId: tenant.id,
    },
  });

  void admin;
  void manager;
  void listing1;
  void listing4;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
