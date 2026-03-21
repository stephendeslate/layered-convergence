import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('SecureP@ss123!', 12);

  // Create 3 users with different roles
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@marketplace.com',
      passwordHash,
      role: 'BUYER',
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@marketplace.com',
      passwordHash,
      role: 'SELLER',
    },
  });

  const arbiter = await prisma.user.create({
    data: {
      email: 'arbiter@marketplace.com',
      passwordHash,
      role: 'ARBITER',
    },
  });

  // Create 3 transactions
  // State transition 1: Transaction PENDING → FUNDED
  const tx1 = await prisma.transaction.create({
    data: {
      amount: 250.0,
      currency: 'USD',
      status: 'PENDING',
      description: 'Logo design project',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  await prisma.transaction.update({
    where: { id: tx1.id },
    data: { status: 'FUNDED' },
  });

  const tx2 = await prisma.transaction.create({
    data: {
      amount: 1500.0,
      currency: 'USD',
      status: 'RELEASED',
      description: 'Website development contract',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  const tx3 = await prisma.transaction.create({
    data: {
      amount: 75.5,
      currency: 'EUR',
      status: 'PENDING',
      description: 'Translation services',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  // Create 3 disputes
  // State transition 2: Dispute OPEN → UNDER_REVIEW → RESOLVED
  const dispute1 = await prisma.dispute.create({
    data: {
      reason: 'Deliverable does not match specification',
      status: 'OPEN',
      transactionId: tx1.id,
      arbiterId: arbiter.id,
    },
  });

  await prisma.dispute.update({
    where: { id: dispute1.id },
    data: { status: 'UNDER_REVIEW' },
  });

  await prisma.dispute.update({
    where: { id: dispute1.id },
    data: {
      status: 'RESOLVED',
      resolution: 'Partial refund of 50% agreed by both parties',
    },
  });

  await prisma.dispute.create({
    data: {
      reason: 'Late delivery beyond agreed deadline',
      status: 'OPEN',
      transactionId: tx2.id,
    },
  });

  await prisma.dispute.create({
    data: {
      reason: 'Quality concerns with deliverable',
      status: 'ESCALATED',
      transactionId: tx3.id,
      arbiterId: arbiter.id,
    },
  });

  // Create 3 payouts
  await prisma.payout.create({
    data: {
      amount: 1500.0,
      currency: 'USD',
      transactionId: tx2.id,
      userId: seller.id,
    },
  });

  await prisma.payout.create({
    data: {
      amount: 125.0,
      currency: 'USD',
      transactionId: tx1.id,
      userId: seller.id,
    },
  });

  await prisma.payout.create({
    data: {
      amount: 125.0,
      currency: 'USD',
      transactionId: tx1.id,
      userId: buyer.id,
    },
  });

  // Create 3 webhooks
  await prisma.webhook.create({
    data: {
      event: 'transaction.funded',
      payload: JSON.stringify({ transactionId: tx1.id, amount: 250.0 }),
      transactionId: tx1.id,
      deliveredAt: new Date(),
    },
  });

  await prisma.webhook.create({
    data: {
      event: 'transaction.released',
      payload: JSON.stringify({ transactionId: tx2.id, amount: 1500.0 }),
      transactionId: tx2.id,
      deliveredAt: new Date(),
    },
  });

  await prisma.webhook.create({
    data: {
      event: 'dispute.opened',
      payload: JSON.stringify({ transactionId: tx3.id, reason: 'Quality concerns' }),
      transactionId: tx3.id,
    },
  });
}

main()
  .catch((e: Error) => {
    process.stderr.write(`Seed error: ${e.message}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
