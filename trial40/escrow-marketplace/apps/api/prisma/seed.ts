import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@escrow-marketplace/shared';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: { name: 'Demo Marketplace' },
  });

  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@demo.com',
      password: passwordHash,
      name: 'Seller User',
      role: 'SELLER',
      balance: new Prisma.Decimal(5000.00),
      tenantId: tenant.id,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@demo.com',
      password: passwordHash,
      name: 'Buyer User',
      role: 'BUYER',
      balance: new Prisma.Decimal(10000.00),
      tenantId: tenant.id,
    },
  });

  const listing1 = await prisma.listing.create({
    data: {
      title: 'Premium Widget',
      slug: 'premium-widget',
      description: 'A high-quality widget for professionals',
      price: new Prisma.Decimal(299.99),
      status: 'ACTIVE',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      title: 'Cancelled Item',
      slug: 'cancelled-item',
      description: 'This listing was cancelled',
      price: new Prisma.Decimal(49.99),
      status: 'CANCELLED',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const completedTx = await prisma.transaction.create({
    data: {
      amount: new Prisma.Decimal(299.99),
      status: 'COMPLETED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing1.id,
      tenantId: tenant.id,
    },
  });

  await prisma.escrowAccount.create({
    data: {
      amount: new Prisma.Decimal(299.99),
      transactionId: completedTx.id,
      tenantId: tenant.id,
    },
  });

  const failedTx = await prisma.transaction.create({
    data: {
      amount: new Prisma.Decimal(49.99),
      status: 'FAILED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing2.id,
      tenantId: tenant.id,
    },
  });

  await prisma.escrowAccount.create({
    data: {
      amount: new Prisma.Decimal(0),
      transactionId: failedTx.id,
      tenantId: tenant.id,
    },
  });

  const disputedTx = await prisma.transaction.create({
    data: {
      amount: new Prisma.Decimal(150.00),
      status: 'DISPUTED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing1.id,
      tenantId: tenant.id,
    },
  });

  await prisma.escrowAccount.create({
    data: {
      amount: new Prisma.Decimal(150.00),
      transactionId: disputedTx.id,
      tenantId: tenant.id,
    },
  });

  await prisma.dispute.create({
    data: {
      reason: 'Item not as described',
      status: 'OPEN',
      transactionId: disputedTx.id,
      tenantId: tenant.id,
    },
  });

  await prisma.dispute.create({
    data: {
      reason: 'Fraudulent seller — account suspended',
      status: 'DISMISSED',
      transactionId: disputedTx.id,
      tenantId: tenant.id,
    },
  });

  // Suppress unused variable warnings
  void admin;
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
