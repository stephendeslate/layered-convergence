import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TRACED: EM-SV-SEED-001 — Seed with tenant, users, entities, error/failure states
async function main() {
  const tenant = await prisma.tenant.create({
    data: { name: 'TrustBay', slug: 'trustbay' },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@trustbay.com',
      passwordHash: '$2b$12$placeholder.hash.seller',
      name: 'Sam Seller',
      role: 'SELLER',
      tenantId: tenant.id,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@trustbay.com',
      passwordHash: '$2b$12$placeholder.hash.buyer',
      name: 'Brenda Buyer',
      role: 'BUYER',
      tenantId: tenant.id,
    },
  });

  const listing = await prisma.listing.create({
    data: {
      title: 'Vintage Watch',
      slug: 'vintage-watch',
      description: 'Rare 1960s chronograph in excellent condition',
      price: 2500.00,
      status: 'ACTIVE',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const completedTxn = await prisma.transaction.create({
    data: {
      listingId: listing.id,
      buyerId: buyer.id,
      amount: 2500.00,
      status: 'COMPLETED',
      tenantId: tenant.id,
    },
  });

  // TRACED: EM-SV-SEED-002 — Error/failure state seed data
  const disputedListing = await prisma.listing.create({
    data: {
      title: 'Broken Electronics',
      slug: 'broken-electronics',
      description: 'Item arrived damaged',
      price: 150.00,
      status: 'SOLD',
      sellerId: seller.id,
      tenantId: tenant.id,
    },
  });

  const disputedTxn = await prisma.transaction.create({
    data: {
      listingId: disputedListing.id,
      buyerId: buyer.id,
      amount: 150.00,
      status: 'DISPUTED',
      tenantId: tenant.id,
    },
  });

  await prisma.dispute.create({
    data: {
      transactionId: disputedTxn.id,
      reason: 'Item arrived damaged, not as described',
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entity: 'Transaction',
      entityId: completedTxn.id,
      tenantId: tenant.id,
    },
  });
}

main()
  .catch((e) => { throw e; })
  .finally(async () => { await prisma.$disconnect(); });
