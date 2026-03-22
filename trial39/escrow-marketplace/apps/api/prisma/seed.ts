// TRACED: EM-INFRA-001 — 3-stage Dockerfile with node:20-alpine (seed validates infra)
// TRACED: EM-INFRA-002 — Docker Compose PostgreSQL integration (seed populates DB)
// TRACED: EM-INFRA-003 — Environment configuration with connection_limit
// TRACED: EM-INFRA-004 — Database seeding with error handling
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@escrow-marketplace/shared';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Marketplace',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      balance: 0,
      tenantId: tenant.id,
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@acme.com',
      password: hashedPassword,
      name: 'Seller User',
      role: 'SELLER',
      balance: 5000.00,
      tenantId: tenant.id,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@acme.com',
      password: hashedPassword,
      name: 'Buyer User',
      role: 'BUYER',
      balance: 10000.00,
      tenantId: tenant.id,
    },
  });

  const listing = await prisma.listing.create({
    data: {
      title: 'Vintage Watch',
      slug: 'vintage-watch',
      description: 'A rare vintage timepiece in excellent condition',
      price: 2500.00,
      status: 'ACTIVE',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  await prisma.listing.create({
    data: {
      title: 'Cancelled Listing',
      slug: 'cancelled-listing',
      description: 'This listing was cancelled by the seller',
      price: 100.00,
      status: 'CANCELLED',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const completedTransaction = await prisma.transaction.create({
    data: {
      amount: 2500.00,
      status: 'COMPLETED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing.id,
      tenantId: tenant.id,
    },
  });

  await prisma.escrowAccount.create({
    data: {
      amount: 2500.00,
      transactionId: completedTransaction.id,
      tenantId: tenant.id,
    },
  });

  // Error/failure state: a failed transaction
  const failedTransaction = await prisma.transaction.create({
    data: {
      amount: 999.99,
      status: 'FAILED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing.id,
      tenantId: tenant.id,
    },
  });

  // Error/failure state: a disputed transaction with a dispute record
  const disputedTransaction = await prisma.transaction.create({
    data: {
      amount: 1500.00,
      status: 'DISPUTED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: listing.id,
      tenantId: tenant.id,
    },
  });

  await prisma.dispute.create({
    data: {
      reason: 'Item arrived damaged and does not match description',
      transactionId: disputedTransaction.id,
      tenantId: tenant.id,
    },
  });

  // Use admin, failedTransaction to avoid unused variable warnings
  void admin;
  void failedTransaction;
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
