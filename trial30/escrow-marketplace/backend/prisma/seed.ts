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

  // Create 3 transactions
  // State transition 1: Transaction PENDING → FUNDED → RELEASED
  const tx1 = await prisma.transaction.create({
    data: {
      amount: 5000.0,
      currency: 'USD',
      status: 'PENDING',
      description: 'Website development project',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  await prisma.transaction.update({
    where: { id: tx1.id },
    data: { status: 'FUNDED' },
  });

  await prisma.transaction.update({
    where: { id: tx1.id },
    data: { status: 'RELEASED' },
  });

  // State transition 2: Transaction PENDING → FUNDED → DISPUTED
  const tx2 = await prisma.transaction.create({
    data: {
      amount: 1200.5,
      currency: 'USD',
      status: 'PENDING',
      description: 'Logo design services',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  await prisma.transaction.update({
    where: { id: tx2.id },
    data: { status: 'FUNDED' },
  });

  await prisma.transaction.update({
    where: { id: tx2.id },
    data: { status: 'DISPUTED' },
  });

  const tx3 = await prisma.transaction.create({
    data: {
      amount: 750.0,
      currency: 'EUR',
      status: 'FUNDED',
      description: 'Content writing package',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  // Create 3 disputes
  // State transition: Dispute OPEN → UNDER_REVIEW → RESOLVED
  const dispute1 = await prisma.dispute.create({
    data: {
      reason: 'Work not delivered as described',
      status: 'OPEN',
      transactionId: tx2.id,
      filedById: buyer.id,
    },
  });

  await prisma.dispute.update({
    where: { id: dispute1.id },
    data: { status: 'UNDER_REVIEW' },
  });

  await prisma.dispute.update({
    where: { id: dispute1.id },
    data: { status: 'RESOLVED', resolution: 'Partial refund of 50% agreed' },
  });

  await prisma.dispute.create({
    data: {
      reason: 'Deadline missed by 2 weeks',
      status: 'OPEN',
      transactionId: tx2.id,
      filedById: buyer.id,
    },
  });

  await prisma.dispute.create({
    data: {
      reason: 'Quality below expectations',
      status: 'ESCALATED',
      transactionId: tx3.id,
      filedById: buyer.id,
    },
  });

  // Create 3 payouts
  await prisma.payout.create({
    data: {
      amount: 5000.0,
      method: 'bank_transfer',
      reference: 'PAY-001-BANK',
      transactionId: tx1.id,
      recipientId: seller.id,
    },
  });

  await prisma.payout.create({
    data: {
      amount: 600.25,
      method: 'paypal',
      reference: 'PAY-002-PP',
      transactionId: tx2.id,
      recipientId: seller.id,
    },
  });

  await prisma.payout.create({
    data: {
      amount: 600.25,
      method: 'bank_transfer',
      reference: 'PAY-003-REFUND',
      transactionId: tx2.id,
      recipientId: buyer.id,
    },
  });

  // Create 3 webhooks
  await prisma.webhook.create({
    data: {
      url: 'https://hooks.example.com/escrow',
      event: 'transaction.released',
      payload: '{"transactionId":"' + tx1.id + '","status":"RELEASED"}',
      deliveredAt: new Date(),
      transactionId: tx1.id,
    },
  });

  await prisma.webhook.create({
    data: {
      url: 'https://hooks.example.com/escrow',
      event: 'transaction.disputed',
      payload: '{"transactionId":"' + tx2.id + '","status":"DISPUTED"}',
      deliveredAt: new Date(),
      transactionId: tx2.id,
    },
  });

  await prisma.webhook.create({
    data: {
      url: 'https://hooks.example.com/notifications',
      event: 'transaction.funded',
      payload: '{"transactionId":"' + tx3.id + '","status":"FUNDED"}',
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
