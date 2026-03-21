import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('SecureP@ss123!', 12);

  // Create 2 users with different roles
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@escrow.com',
      passwordHash,
      role: 'BUYER',
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@escrow.com',
      passwordHash,
      role: 'SELLER',
    },
  });

  // Create arbiter for disputes
  const arbiter = await prisma.user.create({
    data: {
      email: 'arbiter@escrow.com',
      passwordHash,
      role: 'ARBITER',
    },
  });

  // State transition 1: Transaction PENDING → FUNDED → RELEASED
  const transaction1 = await prisma.transaction.create({
    data: {
      amount: 1500.0,
      status: 'PENDING',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  await prisma.transaction.update({
    where: { id: transaction1.id },
    data: { status: 'FUNDED' },
  });

  await prisma.transaction.update({
    where: { id: transaction1.id },
    data: { status: 'RELEASED' },
  });

  // Create payout for released transaction
  await prisma.payout.create({
    data: {
      amount: 1500.0,
      transactionId: transaction1.id,
      userId: seller.id,
    },
  });

  // State transition 2: Transaction PENDING → FUNDED → DISPUTED
  // Then Dispute OPEN → UNDER_REVIEW → RESOLVED
  const transaction2 = await prisma.transaction.create({
    data: {
      amount: 750.5,
      status: 'PENDING',
      buyerId: buyer.id,
      sellerId: seller.id,
    },
  });

  await prisma.transaction.update({
    where: { id: transaction2.id },
    data: { status: 'FUNDED' },
  });

  await prisma.transaction.update({
    where: { id: transaction2.id },
    data: { status: 'DISPUTED' },
  });

  const dispute = await prisma.dispute.create({
    data: {
      reason: 'Item not as described',
      status: 'OPEN',
      transactionId: transaction2.id,
      arbiterId: arbiter.id,
    },
  });

  await prisma.dispute.update({
    where: { id: dispute.id },
    data: { status: 'UNDER_REVIEW' },
  });

  await prisma.dispute.update({
    where: { id: dispute.id },
    data: { status: 'RESOLVED', resolvedAt: new Date() },
  });

  // Create webhook
  await prisma.webhook.create({
    data: {
      url: 'https://example.com/webhooks/escrow',
      event: 'transaction.completed',
      secret: 'webhook-signing-secret',
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
