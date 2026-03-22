// TRACED:EM-SEED-01 database seed with error states
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@em/shared';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Default Marketplace',
      slug: 'default-marketplace',
    },
  });

  const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@escrow.io',
      passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@escrow.io',
      passwordHash,
      role: 'SELLER',
      tenantId: tenant.id,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@escrow.io',
      passwordHash,
      role: 'BUYER',
      tenantId: tenant.id,
    },
  });

  const activeListing = await prisma.listing.create({
    data: {
      title: 'Vintage Camera',
      description: 'A well-preserved vintage film camera from the 1970s',
      price: 299.99,
      status: 'ACTIVE',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const cancelledListing = await prisma.listing.create({
    data: {
      title: 'Broken Electronics',
      description: 'Item listing that was cancelled due to policy violation',
      price: 50.00,
      status: 'CANCELLED',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const completedTransaction = await prisma.transaction.create({
    data: {
      amount: 299.99,
      status: 'COMPLETED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: activeListing.id,
      tenantId: tenant.id,
    },
  });

  const disputedTransaction = await prisma.transaction.create({
    data: {
      amount: 50.00,
      status: 'DISPUTED',
      buyerId: buyer.id,
      sellerId: seller.id,
      listingId: cancelledListing.id,
      tenantId: tenant.id,
    },
  });

  await prisma.escrow.create({
    data: {
      amount: 299.99,
      balance: 0.00,
      status: 'RELEASED',
      transactionId: completedTransaction.id,
      tenantId: tenant.id,
    },
  });

  await prisma.escrow.create({
    data: {
      amount: 50.00,
      balance: 50.00,
      status: 'DISPUTED',
      transactionId: disputedTransaction.id,
      tenantId: tenant.id,
    },
  });

  await prisma.dispute.create({
    data: {
      reason: 'Item not as described, seller unresponsive',
      status: 'OPEN',
      transactionId: disputedTransaction.id,
      filerId: buyer.id,
      respondentId: seller.id,
      tenantId: tenant.id,
    },
  });

  await prisma.dispute.create({
    data: {
      reason: 'Payment was never received despite escrow release',
      resolution: 'Refund issued after investigation',
      status: 'RESOLVED',
      transactionId: completedTransaction.id,
      filerId: seller.id,
      respondentId: buyer.id,
      tenantId: tenant.id,
    },
  });

  console.log('Seed completed successfully');
  console.log({ admin: admin.id, seller: seller.id, buyer: buyer.id });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
