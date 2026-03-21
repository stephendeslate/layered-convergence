// TRACED: EM-SEED-001 — Database seed with escrow states
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Marketplace One',
      slug: 'marketplace-one',
    },
  });

  const passwordHash = await bcrypt.hash('password123', 12);

  const seller = await prisma.user.create({
    data: {
      email: 'seller@marketplace.com',
      passwordHash,
      role: 'SELLER',
      tenantId: tenant.id,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@marketplace.com',
      passwordHash,
      role: 'BUYER',
      balance: 50000.00,
      tenantId: tenant.id,
    },
  });

  const listing1 = await prisma.listing.create({
    data: {
      title: 'Premium Domain',
      description: 'High-value domain name for sale',
      price: 5000.00,
      status: 'ACTIVE',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      title: 'SaaS Business',
      description: 'Profitable SaaS with recurring revenue',
      price: 25000.00,
      status: 'ACTIVE',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  await prisma.listing.create({
    data: {
      title: 'Design Assets',
      description: 'Complete design system with components',
      price: 150.00,
      status: 'SOLD',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  // Escrowed transaction
  const txn1 = await prisma.transaction.create({
    data: {
      amount: 5000.00,
      status: 'ESCROWED',
      listingId: listing1.id,
      buyerId: buyer.id,
      tenantId: tenant.id,
    },
  });

  // Pending transaction
  await prisma.transaction.create({
    data: {
      amount: 25000.00,
      status: 'PENDING',
      listingId: listing2.id,
      buyerId: buyer.id,
      tenantId: tenant.id,
    },
  });

  // Disputed transaction — error state
  const txnDisputed = await prisma.transaction.create({
    data: {
      amount: 5000.00,
      status: 'DISPUTED',
      listingId: listing1.id,
      buyerId: buyer.id,
      tenantId: tenant.id,
    },
  });

  // Open dispute
  await prisma.dispute.create({
    data: {
      reason: 'Item not as described',
      status: 'OPEN',
      transactionId: txnDisputed.id,
      filedById: buyer.id,
      tenantId: tenant.id,
    },
  });

  // Resolved dispute
  await prisma.dispute.create({
    data: {
      reason: 'Delivery issue',
      status: 'RESOLVED',
      resolution: 'Refund issued to buyer',
      transactionId: txn1.id,
      filedById: buyer.id,
      tenantId: tenant.id,
      resolvedAt: new Date(),
    },
  });
}

main()
  .catch((e) => {
    process.stderr.write(String(e));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
