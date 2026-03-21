import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('SecureP@ss123', 12);

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: { name: 'TrustTrade Market', slug: 'trusttrade' },
  });

  // Create users with all roles
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@trusttrade.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const buyer = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'buyer@trusttrade.com',
      passwordHash,
      role: 'BUYER',
    },
  });

  const seller = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'seller@trusttrade.com',
      passwordHash,
      role: 'SELLER',
    },
  });

  const arbiter = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'arbiter@trusttrade.com',
      passwordHash,
      role: 'ARBITER',
    },
  });

  // Escrow Transactions (including refunded/cancelled states)
  const tx1 = await prisma.escrowTransaction.create({
    data: {
      tenantId: tenant.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      amount: 500.0,
      status: 'FUNDED',
      description: 'Custom artwork commission',
    },
  });

  await prisma.escrowTransaction.create({
    data: {
      tenantId: tenant.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      amount: 1200.0,
      status: 'RELEASED',
      description: 'Website development project',
    },
  });

  const tx3 = await prisma.escrowTransaction.create({
    data: {
      tenantId: tenant.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      amount: 250.0,
      status: 'DISPUTED',
      description: 'Logo design — quality dispute',
    },
  });

  await prisma.escrowTransaction.create({
    data: {
      tenantId: tenant.id,
      buyerId: buyer.id,
      sellerId: seller.id,
      amount: 75.0,
      status: 'REFUNDED',
      description: 'Cancelled service — mutual refund',
    },
  });

  // Disputes (including escalated state)
  await prisma.dispute.create({
    data: {
      transactionId: tx3.id,
      filedById: buyer.id,
      assignedToId: arbiter.id,
      status: 'UNDER_REVIEW',
      reason: 'Deliverable does not match specification',
    },
  });

  await prisma.dispute.create({
    data: {
      transactionId: tx1.id,
      filedById: seller.id,
      status: 'ESCALATED',
      reason: 'Buyer unresponsive for 14 days',
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: buyer.id,
      action: 'CREATE',
      entity: 'escrow_transaction',
      entityId: tx1.id,
    },
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
