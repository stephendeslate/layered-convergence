import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('SecureP@ss123!', 12);

  // Create users with different roles
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@example.com',
      passwordHash,
      role: 'BUYER',
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      passwordHash,
      role: 'SELLER',
    },
  });

  const arbiter = await prisma.user.create({
    data: {
      email: 'arbiter@example.com',
      passwordHash,
      role: 'ARBITER',
    },
  });

  // Transaction 1: PENDING -> FUNDED -> RELEASED (successful flow)
  const txn1 = await prisma.transaction.create({
    data: {
      amount: 1500.00,
      currency: 'USD',
      status: 'PENDING',
      description: 'Web design project milestone 1',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  await prisma.transaction.update({
    where: { id: txn1.id },
    data: { status: 'FUNDED' },
  });

  await prisma.transaction.update({
    where: { id: txn1.id },
    data: { status: 'RELEASED' },
  });

  // Transaction 2: PENDING -> FUNDED -> DISPUTED (T31 variation: error state)
  const txn2 = await prisma.transaction.create({
    data: {
      amount: 3200.50,
      currency: 'USD',
      status: 'PENDING',
      description: 'Mobile app development phase 2',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  await prisma.transaction.update({
    where: { id: txn2.id },
    data: { status: 'FUNDED' },
  });

  await prisma.transaction.update({
    where: { id: txn2.id },
    data: { status: 'DISPUTED' },
  });

  // Transaction 3: PENDING -> FUNDED -> REFUNDED
  const txn3 = await prisma.transaction.create({
    data: {
      amount: 750.00,
      currency: 'EUR',
      status: 'PENDING',
      description: 'Logo design consultation',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  await prisma.transaction.update({
    where: { id: txn3.id },
    data: { status: 'FUNDED' },
  });

  await prisma.transaction.update({
    where: { id: txn3.id },
    data: { status: 'REFUNDED' },
  });

  // Dispute for transaction 2
  const dispute1 = await prisma.dispute.create({
    data: {
      reason: 'Deliverables do not match specifications',
      status: 'OPEN',
      transactionId: txn2.id,
      arbiterId: arbiter.id,
    },
  });

  await prisma.dispute.update({
    where: { id: dispute1.id },
    data: { status: 'UNDER_REVIEW' },
  });

  // Second dispute (escalated)
  await prisma.dispute.create({
    data: {
      reason: 'Seller unresponsive for 14 days',
      status: 'ESCALATED',
      transactionId: txn2.id,
      arbiterId: arbiter.id,
    },
  });

  // Payout for released transaction
  await prisma.payout.create({
    data: {
      amount: 1425.00,
      method: 'bank_transfer',
      status: 'COMPLETED',
      userId: seller.id,
      transactionId: txn1.id,
      processedAt: new Date(),
    },
  });

  await prisma.payout.create({
    data: {
      amount: 75.00,
      method: 'platform_fee',
      status: 'COMPLETED',
      userId: seller.id,
      transactionId: txn1.id,
      processedAt: new Date(),
    },
  });

  // Webhook configurations
  await prisma.webhook.create({
    data: {
      url: 'https://hooks.example.com/escrow/events',
      event: 'transaction.status_changed',
      secret: 'whsec_test_webhook_secret_key',
      active: true,
    },
  });

  await prisma.webhook.create({
    data: {
      url: 'https://hooks.example.com/escrow/disputes',
      event: 'dispute.created',
      secret: 'whsec_test_dispute_webhook_key',
      active: true,
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
