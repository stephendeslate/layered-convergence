import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const buyer1 = await prisma.user.upsert({
    where: { email: 'buyer@demo.com' },
    update: {},
    create: {
      email: 'buyer@demo.com',
      passwordHash,
      name: 'Alice Buyer',
      role: 'BUYER',
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: 'buyer2@demo.com' },
    update: {},
    create: {
      email: 'buyer2@demo.com',
      passwordHash,
      name: 'Charlie Buyer',
      role: 'BUYER',
    },
  });

  const provider1 = await prisma.user.upsert({
    where: { email: 'provider@demo.com' },
    update: {},
    create: {
      email: 'provider@demo.com',
      passwordHash,
      name: 'Bob Provider',
      role: 'PROVIDER',
    },
  });

  const provider2 = await prisma.user.upsert({
    where: { email: 'provider2@demo.com' },
    update: {},
    create: {
      email: 'provider2@demo.com',
      passwordHash,
      name: 'Diana Provider',
      role: 'PROVIDER',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('Users created:', {
    buyer1: buyer1.id,
    buyer2: buyer2.id,
    provider1: provider1.id,
    provider2: provider2.id,
    admin: admin.id,
  });

  const tx1 = await prisma.transaction.create({
    data: {
      buyerId: buyer1.id,
      providerId: provider1.id,
      amount: 10000,
      description: 'Logo design project',
      status: 'CREATED',
      platformFeeAmount: 1000,
      platformFeePercent: 10,
    },
  });

  await prisma.transactionStateHistory.create({
    data: {
      transactionId: tx1.id,
      fromState: 'CREATED',
      toState: 'CREATED',
      reason: 'Transaction created',
      performedBy: buyer1.id,
    },
  });

  const tx2 = await prisma.transaction.create({
    data: {
      buyerId: buyer1.id,
      providerId: provider1.id,
      amount: 25000,
      description: 'Website development',
      status: 'HELD',
      platformFeeAmount: 2500,
      platformFeePercent: 10,
      holdExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.transactionStateHistory.createMany({
    data: [
      {
        transactionId: tx2.id,
        fromState: 'CREATED',
        toState: 'CREATED',
        reason: 'Transaction created',
        performedBy: buyer1.id,
      },
      {
        transactionId: tx2.id,
        fromState: 'CREATED',
        toState: 'HELD',
        reason: 'Payment confirmed by Stripe',
        performedBy: 'system',
      },
    ],
  });

  const tx3 = await prisma.transaction.create({
    data: {
      buyerId: buyer2.id,
      providerId: provider2.id,
      amount: 5000,
      description: 'Content writing',
      status: 'RELEASED',
      platformFeeAmount: 500,
      platformFeePercent: 10,
      releasedAt: new Date(),
    },
  });

  await prisma.transactionStateHistory.createMany({
    data: [
      {
        transactionId: tx3.id,
        fromState: 'CREATED',
        toState: 'CREATED',
        reason: 'Transaction created',
        performedBy: buyer2.id,
      },
      {
        transactionId: tx3.id,
        fromState: 'CREATED',
        toState: 'HELD',
        reason: 'Payment confirmed by Stripe',
        performedBy: 'system',
      },
      {
        transactionId: tx3.id,
        fromState: 'HELD',
        toState: 'RELEASED',
        reason: 'Buyer confirmed delivery',
        performedBy: buyer2.id,
      },
    ],
  });

  await prisma.payout.create({
    data: {
      transactionId: tx3.id,
      providerId: provider2.id,
      amount: 4500,
      currency: 'usd',
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  const tx4 = await prisma.transaction.create({
    data: {
      buyerId: buyer1.id,
      providerId: provider2.id,
      amount: 15000,
      description: 'Mobile app UI design',
      status: 'DISPUTED',
      platformFeeAmount: 1500,
      platformFeePercent: 10,
    },
  });

  await prisma.transactionStateHistory.createMany({
    data: [
      {
        transactionId: tx4.id,
        fromState: 'CREATED',
        toState: 'CREATED',
        reason: 'Transaction created',
        performedBy: buyer1.id,
      },
      {
        transactionId: tx4.id,
        fromState: 'CREATED',
        toState: 'HELD',
        reason: 'Payment confirmed by Stripe',
        performedBy: 'system',
      },
      {
        transactionId: tx4.id,
        fromState: 'HELD',
        toState: 'DISPUTED',
        reason: 'Dispute raised: SERVICE_NOT_AS_DESCRIBED',
        performedBy: buyer1.id,
      },
    ],
  });

  await prisma.dispute.create({
    data: {
      transactionId: tx4.id,
      raisedById: buyer1.id,
      reason: 'SERVICE_NOT_AS_DESCRIBED',
      description: 'The delivered design does not match the agreed specifications.',
      status: 'OPEN',
    },
  });

  console.log('Transactions created:', {
    tx1: { id: tx1.id, status: tx1.status },
    tx2: { id: tx2.id, status: tx2.status },
    tx3: { id: tx3.id, status: tx3.status },
    tx4: { id: tx4.id, status: tx4.status },
  });

  console.log('Seed completed successfully.');
  console.log('\nDemo credentials (all passwords: Password123!):');
  console.log('  Buyer:    buyer@demo.com');
  console.log('  Buyer 2:  buyer2@demo.com');
  console.log('  Provider: provider@demo.com');
  console.log('  Provider2:provider2@demo.com');
  console.log('  Admin:    admin@demo.com');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
