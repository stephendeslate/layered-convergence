import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const SALT_ROUNDS = 12;
  const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

  // Create tenant
  const tenant = await prisma.tenant.create({ data: { name: 'MarketCo' } });

  // Create users with different roles
  const buyer = await prisma.user.create({
    data: { email: 'buyer@marketco.com', password: hashedPassword, role: 'BUYER', tenantId: tenant.id },
  });

  const seller = await prisma.user.create({
    data: { email: 'seller@marketco.com', password: hashedPassword, role: 'SELLER', tenantId: tenant.id },
  });

  await prisma.user.create({
    data: { email: 'arbiter@marketco.com', password: hashedPassword, role: 'ARBITER', tenantId: tenant.id },
  });

  // Create transactions with state transitions
  const tx1 = await prisma.transaction.create({
    data: {
      amount: 1500.00,
      currency: 'USD',
      buyerId: buyer.id,
      sellerId: seller.id,
      description: 'Custom widget development',
      tenantId: tenant.id,
    },
  });

  // Transition PENDING -> FUNDED -> RELEASED (success path)
  await prisma.transaction.update({ where: { id: tx1.id }, data: { status: 'FUNDED' } });
  await prisma.transaction.update({ where: { id: tx1.id }, data: { status: 'RELEASED' } });

  // Create a disputed transaction (error/conflict state)
  const tx2 = await prisma.transaction.create({
    data: {
      amount: 750.50,
      currency: 'USD',
      buyerId: buyer.id,
      sellerId: seller.id,
      description: 'Logo design project',
      tenantId: tenant.id,
    },
  });
  await prisma.transaction.update({ where: { id: tx2.id }, data: { status: 'FUNDED' } });
  await prisma.transaction.update({ where: { id: tx2.id }, data: { status: 'DISPUTED' } });

  // Create dispute for the disputed transaction
  const dispute1 = await prisma.dispute.create({
    data: {
      reason: 'Deliverable does not match specifications',
      transactionId: tx2.id,
      filedById: buyer.id,
      tenantId: tenant.id,
    },
  });

  // Transition dispute: OPEN -> UNDER_REVIEW -> RESOLVED
  await prisma.dispute.update({ where: { id: dispute1.id }, data: { status: 'UNDER_REVIEW' } });
  await prisma.dispute.update({
    where: { id: dispute1.id },
    data: { status: 'RESOLVED', resolution: 'Partial refund of 50% agreed upon' },
  });

  // Create a refunded transaction (failure path)
  const tx3 = await prisma.transaction.create({
    data: {
      amount: 200.00,
      currency: 'EUR',
      buyerId: buyer.id,
      sellerId: seller.id,
      description: 'Translation services',
      tenantId: tenant.id,
    },
  });
  await prisma.transaction.update({ where: { id: tx3.id }, data: { status: 'FUNDED' } });
  await prisma.transaction.update({ where: { id: tx3.id }, data: { status: 'DISPUTED' } });
  await prisma.transaction.update({ where: { id: tx3.id }, data: { status: 'REFUNDED' } });

  // Create payouts
  await prisma.payout.create({
    data: {
      amount: 1500.00,
      currency: 'USD',
      recipientId: seller.id,
      transactionId: tx1.id,
      tenantId: tenant.id,
      processedAt: new Date(),
    },
  });

  // Create webhooks
  await prisma.webhook.create({
    data: {
      url: 'https://api.marketco.com/webhooks/escrow',
      events: ['transaction.funded', 'transaction.released', 'dispute.opened'],
      tenantId: tenant.id,
    },
  });

  // Inactive webhook
  await prisma.webhook.create({
    data: {
      url: 'https://old.marketco.com/webhooks',
      events: ['transaction.funded'],
      isActive: false,
      tenantId: tenant.id,
    },
  });
}

main()
  .catch((e: unknown) => {
    if (e instanceof Error) {
      process.stderr.write(e.message + '\n');
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
