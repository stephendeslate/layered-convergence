import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data (in reverse dependency order)
  await prisma.transactionStateHistory.deleteMany();
  await prisma.disputeEvidence.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.stripeConnectedAccount.deleteMany();
  await prisma.webhookLog.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hashSync(pw, 4);

  // ─── Users: 10 Buyers ────────────────────────────────────────────────────

  const buyerData = [
    { email: 'alice.buyer@demo.com', displayName: 'Alice Johnson' },
    { email: 'bob.buyer@demo.com', displayName: 'Bob Williams' },
    { email: 'carol.buyer@demo.com', displayName: 'Carol Davis' },
    { email: 'dan.buyer@demo.com', displayName: 'Dan Miller' },
    { email: 'emma.buyer@demo.com', displayName: 'Emma Wilson' },
    { email: 'frank.buyer@demo.com', displayName: 'Frank Brown' },
    { email: 'grace.buyer@demo.com', displayName: 'Grace Taylor' },
    { email: 'henry.buyer@demo.com', displayName: 'Henry Anderson' },
    { email: 'iris.buyer@demo.com', displayName: 'Iris Thomas' },
    { email: 'jack.buyer@demo.com', displayName: 'Jack Martinez' },
  ];

  const buyers = [];
  for (const b of buyerData) {
    const user = await prisma.user.create({
      data: {
        email: b.email,
        passwordHash: hash('DemoPass123'),
        displayName: b.displayName,
        role: 'BUYER',
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    buyers.push(user);
  }

  console.log(`Created ${buyers.length} buyers`);

  // ─── Users: 5 Providers ──────────────────────────────────────────────────

  const providerData = [
    { email: 'dave.provider@demo.com', displayName: 'Dave Creative Studio' },
    { email: 'eve.provider@demo.com', displayName: 'Eve Design Co' },
    { email: 'frank.provider@demo.com', displayName: 'Frank Digital Agency' },
    { email: 'gina.provider@demo.com', displayName: 'Gina Web Solutions' },
    { email: 'hank.provider@demo.com', displayName: 'Hank Photo Services' },
  ];

  const providers = [];
  for (const p of providerData) {
    const user = await prisma.user.create({
      data: {
        email: p.email,
        passwordHash: hash('DemoPass123'),
        displayName: p.displayName,
        role: 'PROVIDER',
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
    providers.push(user);
  }

  console.log(`Created ${providers.length} providers`);

  // ─── Users: 2 Admins ────────────────────────────────────────────────────

  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash: hash('AdminPass123'),
      displayName: 'Platform Admin',
      role: 'ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: 'admin2@demo.com',
      passwordHash: hash('AdminPass123'),
      displayName: 'Senior Admin',
      role: 'ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('Created 2 admins');

  // ─── Stripe Connected Accounts (5 providers, various statuses) ─────────

  // Provider 0: COMPLETE — fully onboarded
  const acct0 = await prisma.stripeConnectedAccount.create({
    data: {
      userId: providers[0].id,
      stripeAccountId: 'acct_mock_provider_dave',
      onboardingStatus: 'COMPLETE',
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
    },
  });

  // Provider 1: COMPLETE — fully onboarded
  const acct1 = await prisma.stripeConnectedAccount.create({
    data: {
      userId: providers[1].id,
      stripeAccountId: 'acct_mock_provider_eve',
      onboardingStatus: 'COMPLETE',
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: true,
    },
  });

  // Provider 2: PENDING — started but not finished
  const acct2 = await prisma.stripeConnectedAccount.create({
    data: {
      userId: providers[2].id,
      stripeAccountId: 'acct_mock_provider_frank',
      onboardingStatus: 'PENDING',
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      onboardingUrl: 'https://connect.stripe.com/setup/mock/acct_mock_provider_frank',
    },
  });

  // Provider 3: RESTRICTED — submitted but restricted
  const acct3 = await prisma.stripeConnectedAccount.create({
    data: {
      userId: providers[3].id,
      stripeAccountId: 'acct_mock_provider_gina',
      onboardingStatus: 'RESTRICTED',
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: true,
    },
  });

  // Provider 4: NOT_STARTED — no connected account record needed,
  // but we create one to show the status
  const acct4 = await prisma.stripeConnectedAccount.create({
    data: {
      userId: providers[4].id,
      stripeAccountId: 'acct_mock_provider_hank',
      onboardingStatus: 'NOT_STARTED',
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    },
  });

  const onboardedAccounts = [acct0, acct1]; // Only fully onboarded providers
  console.log('Created 5 connected accounts (2 COMPLETE, 1 PENDING, 1 RESTRICTED, 1 NOT_STARTED)');

  // ─── Helper functions ────────────────────────────────────────────────────

  const now = new Date();
  const ago = (hours: number) => new Date(now.getTime() - hours * 3600000);
  const future = (hours: number) => new Date(now.getTime() + hours * 3600000);
  let mockCounter = 0;
  const mockId = (prefix: string) => `${prefix}_mock_seed_${++mockCounter}`;

  const createTx = async (
    data: Parameters<typeof prisma.transaction.create>[0]['data'],
    history: Array<{
      fromStatus: string | null;
      toStatus: string;
      action: string;
      actorId?: string | null;
      createdAt?: Date;
    }>,
  ) => {
    const txn = await prisma.transaction.create({ data: data as any });
    let histTime = data.createdAt ? new Date(data.createdAt as string | Date) : ago(200);
    for (const h of history) {
      histTime = h.createdAt || new Date(histTime.getTime() + 3600000); // +1hr per event
      await prisma.transactionStateHistory.create({
        data: {
          transactionId: txn.id,
          fromStatus: h.fromStatus as any,
          toStatus: h.toStatus as any,
          action: h.action as any,
          actorId: h.actorId || null,
          createdAt: histTime,
        },
      });
    }
    return txn;
  };

  // Fee calculation helper (10% with $0.50 minimum)
  const calcFee = (amount: number) => {
    let fee = Math.floor(amount * 10 / 100);
    if (fee < 50) fee = 50;
    return { platformFee: fee, providerAmount: amount - fee };
  };

  // ─── Descriptions for varied transactions ────────────────────────────────

  const descriptions = [
    'Logo design for tech startup',
    'Brand identity package',
    'Business card and letterhead design',
    'Social media kit (10 templates)',
    'Website mockup design',
    'Mobile app UI/UX design',
    'Product photography (20 items)',
    'Video editing for YouTube channel',
    'Podcast intro/outro music',
    'Presentation design (30 slides)',
    'Infographic design',
    'Email newsletter template',
    'eBook cover design',
    'T-shirt graphic design',
    'Restaurant menu design',
    'Wedding invitation design',
    'Event poster design',
    'Company profile brochure',
    'Instagram content calendar',
    'SEO audit report',
    'Copywriting for landing page',
    'Translation services (EN→ES)',
    'Voiceover for explainer video',
    'Illustration (character design)',
    'Icon set (50 icons)',
    'Custom WordPress theme',
    'Shopify store setup',
    'Data visualization dashboard',
    'Technical documentation',
    'Animation (15-second loop)',
    'Whiteboard video script',
    'Banner ad design set',
    'Packaging design',
    'Newsletter content writing',
    'Market research report',
    'User testing report',
    'Wireframe prototype',
    'QA testing for web app',
    'API documentation',
    'Cloud architecture diagram',
    'Security audit report',
    'Performance optimization',
    'Database schema design',
    'CI/CD pipeline setup',
    'Docker containerization',
    'Kubernetes deployment config',
    'Load testing report',
    'Accessibility audit',
    'Color palette and style guide',
    'Print-ready catalog design',
  ];

  const amounts = [
    500, 750, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500,
    5000, 6000, 7500, 8000, 10000, 12000, 15000, 18000, 20000, 25000,
    30000, 35000, 40000, 50000, 60000, 75000, 80000, 100000, 150000, 200000,
  ];

  // Use first 2 onboarded providers (0 and 1) for transactions
  const activeProviders = [providers[0], providers[1]];
  const activeAccounts = [acct0, acct1];

  const allTxns: any[] = [];

  // ─── Transactions: 8 CREATED ──────────────────────────────────────────────

  for (let i = 0; i < 8; i++) {
    const buyer = buyers[i % buyers.length];
    const provIdx = i % 2;
    const provider = activeProviders[provIdx];
    const amount = amounts[i % amounts.length];
    const { platformFee, providerAmount } = calcFee(amount);

    const txn = await createTx(
      {
        buyerId: buyer.id,
        providerId: provider.id,
        amount,
        platformFee,
        providerAmount,
        description: descriptions[i],
        status: 'CREATED',
        stripePaymentIntentId: mockId('pi'),
        createdAt: ago(2 + i),
      },
      [
        { fromStatus: null, toStatus: 'CREATED', action: 'TRANSACTION_CREATED', actorId: buyer.id },
      ],
    );
    allTxns.push(txn);
  }

  // ─── Transactions: 6 PAYMENT_HELD ─────────────────────────────────────────

  for (let i = 0; i < 6; i++) {
    const buyer = buyers[(i + 2) % buyers.length];
    const provIdx = i % 2;
    const provider = activeProviders[provIdx];
    const amount = amounts[(i + 8) % amounts.length];
    const { platformFee, providerAmount } = calcFee(amount);

    const txn = await createTx(
      {
        buyerId: buyer.id,
        providerId: provider.id,
        amount,
        platformFee,
        providerAmount,
        description: descriptions[i + 8],
        status: 'PAYMENT_HELD',
        stripePaymentIntentId: mockId('pi'),
        stripeChargeId: mockId('ch'),
        paymentHeldAt: ago(48 + i * 12),
        createdAt: ago(72 + i * 12),
      },
      [
        { fromStatus: null, toStatus: 'CREATED', action: 'TRANSACTION_CREATED', actorId: buyer.id },
        { fromStatus: 'CREATED', toStatus: 'PAYMENT_HELD', action: 'PAYMENT_HELD' },
      ],
    );
    allTxns.push(txn);
  }

  // ─── Transactions: 8 DELIVERED ────────────────────────────────────────────

  for (let i = 0; i < 8; i++) {
    const buyer = buyers[(i + 4) % buyers.length];
    const provIdx = i % 2;
    const provider = activeProviders[provIdx];
    const amount = amounts[(i + 14) % amounts.length];
    const { platformFee, providerAmount } = calcFee(amount);

    const txn = await createTx(
      {
        buyerId: buyer.id,
        providerId: provider.id,
        amount,
        platformFee,
        providerAmount,
        description: descriptions[i + 14],
        status: 'DELIVERED',
        stripePaymentIntentId: mockId('pi'),
        stripeChargeId: mockId('ch'),
        paymentHeldAt: ago(120 + i * 24),
        deliveredAt: ago(24 + i * 6),
        autoReleaseAt: future(48 - i * 6),
        createdAt: ago(144 + i * 24),
      },
      [
        { fromStatus: null, toStatus: 'CREATED', action: 'TRANSACTION_CREATED', actorId: buyer.id },
        { fromStatus: 'CREATED', toStatus: 'PAYMENT_HELD', action: 'PAYMENT_HELD' },
        { fromStatus: 'PAYMENT_HELD', toStatus: 'DELIVERED', action: 'DELIVERY_MARKED', actorId: provider.id },
      ],
    );
    allTxns.push(txn);
  }

  // ─── Transactions: 6 RELEASED ─────────────────────────────────────────────

  for (let i = 0; i < 6; i++) {
    const buyer = buyers[(i + 6) % buyers.length];
    const provIdx = i % 2;
    const provider = activeProviders[provIdx];
    const amount = amounts[(i + 22) % amounts.length];
    const { platformFee, providerAmount } = calcFee(amount);
    const isAutoRelease = i >= 4;

    const txn = await createTx(
      {
        buyerId: buyer.id,
        providerId: provider.id,
        amount,
        platformFee,
        providerAmount,
        description: descriptions[i + 22],
        status: 'RELEASED',
        stripePaymentIntentId: mockId('pi'),
        stripeChargeId: mockId('ch'),
        stripeTransferId: mockId('tr'),
        paymentHeldAt: ago(240 + i * 48),
        deliveredAt: ago(168 + i * 24),
        releasedAt: ago(72 + i * 12),
        createdAt: ago(264 + i * 48),
      },
      [
        { fromStatus: null, toStatus: 'CREATED', action: 'TRANSACTION_CREATED', actorId: buyer.id },
        { fromStatus: 'CREATED', toStatus: 'PAYMENT_HELD', action: 'PAYMENT_HELD' },
        { fromStatus: 'PAYMENT_HELD', toStatus: 'DELIVERED', action: 'DELIVERY_MARKED', actorId: provider.id },
        {
          fromStatus: 'DELIVERED',
          toStatus: 'RELEASED',
          action: isAutoRelease ? 'AUTO_RELEASE_TRIGGERED' : 'DELIVERY_CONFIRMED',
          actorId: isAutoRelease ? null : buyer.id,
        },
      ],
    );
    allTxns.push(txn);
  }

  // ─── Transactions: 8 PAID_OUT ─────────────────────────────────────────────

  for (let i = 0; i < 8; i++) {
    const buyer = buyers[i % buyers.length];
    const provIdx = i % 2;
    const provider = activeProviders[provIdx];
    const amount = amounts[(i + 5) % amounts.length];
    const { platformFee, providerAmount } = calcFee(amount);

    const txn = await createTx(
      {
        buyerId: buyer.id,
        providerId: provider.id,
        amount,
        platformFee,
        providerAmount,
        description: descriptions[i + 28],
        status: 'PAID_OUT',
        stripePaymentIntentId: mockId('pi'),
        stripeChargeId: mockId('ch'),
        stripeTransferId: mockId('tr'),
        paymentHeldAt: ago(480 + i * 48),
        deliveredAt: ago(360 + i * 36),
        releasedAt: ago(240 + i * 24),
        paidOutAt: ago(120 + i * 12),
        createdAt: ago(504 + i * 48),
      },
      [
        { fromStatus: null, toStatus: 'CREATED', action: 'TRANSACTION_CREATED', actorId: buyer.id },
        { fromStatus: 'CREATED', toStatus: 'PAYMENT_HELD', action: 'PAYMENT_HELD' },
        { fromStatus: 'PAYMENT_HELD', toStatus: 'DELIVERED', action: 'DELIVERY_MARKED', actorId: provider.id },
        { fromStatus: 'DELIVERED', toStatus: 'RELEASED', action: 'DELIVERY_CONFIRMED', actorId: buyer.id },
        { fromStatus: 'RELEASED', toStatus: 'PAID_OUT', action: 'PAYOUT_COMPLETED' },
      ],
    );
    allTxns.push(txn);
  }

  // ─── Transactions: 5 DISPUTED ─────────────────────────────────────────────

  const disputedTxns = [];
  for (let i = 0; i < 5; i++) {
    const buyer = buyers[(i + 3) % buyers.length];
    const provIdx = i % 2;
    const provider = activeProviders[provIdx];
    const amount = amounts[(i + 10) % amounts.length];
    const { platformFee, providerAmount } = calcFee(amount);
    const fromDelivered = i < 3; // first 3 from DELIVERED, last 2 from PAYMENT_HELD

    const txn = await createTx(
      {
        buyerId: buyer.id,
        providerId: provider.id,
        amount,
        platformFee,
        providerAmount,
        description: descriptions[i + 36],
        status: 'DISPUTED',
        stripePaymentIntentId: mockId('pi'),
        stripeChargeId: mockId('ch'),
        paymentHeldAt: ago(200 + i * 48),
        deliveredAt: fromDelivered ? ago(120 + i * 24) : undefined,
        disputedAt: ago(48 + i * 12),
        createdAt: ago(224 + i * 48),
      },
      fromDelivered
        ? [
            { fromStatus: null, toStatus: 'CREATED', action: 'TRANSACTION_CREATED', actorId: buyer.id },
            { fromStatus: 'CREATED', toStatus: 'PAYMENT_HELD', action: 'PAYMENT_HELD' },
            { fromStatus: 'PAYMENT_HELD', toStatus: 'DELIVERED', action: 'DELIVERY_MARKED', actorId: provider.id },
            { fromStatus: 'DELIVERED', toStatus: 'DISPUTED', action: 'DISPUTE_OPENED', actorId: buyer.id },
          ]
        : [
            { fromStatus: null, toStatus: 'CREATED', action: 'TRANSACTION_CREATED', actorId: buyer.id },
            { fromStatus: 'CREATED', toStatus: 'PAYMENT_HELD', action: 'PAYMENT_HELD' },
            { fromStatus: 'PAYMENT_HELD', toStatus: 'DISPUTED', action: 'DISPUTE_OPENED', actorId: buyer.id },
          ],
    );
    disputedTxns.push(txn);
    allTxns.push(txn);
  }

  // ─── Transactions: 4 REFUNDED ─────────────────────────────────────────────

  for (let i = 0; i < 4; i++) {
    const buyer = buyers[(i + 7) % buyers.length];
    const provIdx = i % 2;
    const provider = activeProviders[provIdx];
    const amount = amounts[(i + 15) % amounts.length];
    const { platformFee, providerAmount } = calcFee(amount);

    const txn = await createTx(
      {
        buyerId: buyer.id,
        providerId: provider.id,
        amount,
        platformFee,
        providerAmount,
        description: descriptions[i + 41],
        status: 'REFUNDED',
        stripePaymentIntentId: mockId('pi'),
        stripeChargeId: mockId('ch'),
        stripeRefundId: mockId('re'),
        paymentHeldAt: ago(300 + i * 48),
        disputedAt: ago(200 + i * 36),
        refundedAt: ago(120 + i * 24),
        createdAt: ago(324 + i * 48),
      },
      [
        { fromStatus: null, toStatus: 'CREATED', action: 'TRANSACTION_CREATED', actorId: buyer.id },
        { fromStatus: 'CREATED', toStatus: 'PAYMENT_HELD', action: 'PAYMENT_HELD' },
        { fromStatus: 'PAYMENT_HELD', toStatus: 'DISPUTED', action: 'DISPUTE_OPENED', actorId: buyer.id },
        { fromStatus: 'DISPUTED', toStatus: 'REFUNDED', action: 'DISPUTE_RESOLVED', actorId: admin1.id },
      ],
    );
    allTxns.push(txn);
  }

  // ─── Transactions: 3 EXPIRED ──────────────────────────────────────────────

  for (let i = 0; i < 3; i++) {
    const buyer = buyers[(i + 5) % buyers.length];
    const provider = activeProviders[i % 2];
    const amount = amounts[(i + 2) % amounts.length];
    const { platformFee, providerAmount } = calcFee(amount);

    const txn = await createTx(
      {
        buyerId: buyer.id,
        providerId: provider.id,
        amount,
        platformFee,
        providerAmount,
        description: descriptions[i + 45],
        status: 'EXPIRED',
        stripePaymentIntentId: mockId('pi'),
        expiredAt: ago(48 + i * 24),
        createdAt: ago(168 + i * 24),
      },
      [
        { fromStatus: null, toStatus: 'CREATED', action: 'TRANSACTION_CREATED', actorId: buyer.id },
        { fromStatus: 'CREATED', toStatus: 'EXPIRED', action: 'HOLD_EXPIRED' },
      ],
    );
    allTxns.push(txn);
  }

  // ─── Transactions: 2 CANCELLED ────────────────────────────────────────────

  for (let i = 0; i < 2; i++) {
    const buyer = buyers[(i + 8) % buyers.length];
    const provider = activeProviders[i % 2];
    const amount = amounts[(i + 1) % amounts.length];
    const { platformFee, providerAmount } = calcFee(amount);

    const txn = await createTx(
      {
        buyerId: buyer.id,
        providerId: provider.id,
        amount,
        platformFee,
        providerAmount,
        description: descriptions[i + 48],
        status: 'CANCELLED',
        stripePaymentIntentId: mockId('pi'),
        createdAt: ago(24 + i * 12),
      },
      [
        { fromStatus: null, toStatus: 'CREATED', action: 'TRANSACTION_CREATED', actorId: buyer.id },
        { fromStatus: 'CREATED', toStatus: 'CANCELLED', action: 'TRANSACTION_CANCELLED', actorId: buyer.id },
      ],
    );
    allTxns.push(txn);
  }

  console.log(`Created ${allTxns.length} transactions in various states`);

  // ─── Disputes (5 with evidence) ──────────────────────────────────────────

  const disputeReasons = [
    'NOT_AS_DESCRIBED',
    'NOT_DELIVERED',
    'QUALITY_ISSUE',
    'LATE_DELIVERY',
    'COMMUNICATION_ISSUE',
  ] as const;

  const disputeDescriptions = [
    'The delivered design does not match the agreed mockup. Colors and layout are completely different from what was shown in the preview.',
    'Provider has not delivered the work despite the payment being held for over a week. No communication for the last 5 days.',
    'The delivered files are extremely low resolution (72 DPI instead of the agreed 300 DPI) and unusable for the intended purpose.',
    'Project was due 3 weeks ago. Provider keeps pushing back the deadline without reasonable explanation.',
    'Provider became unresponsive after receiving the initial brief. No updates in 10 days despite multiple attempts to reach them.',
  ];

  const disputeStatuses = [
    'OPEN',
    'OPEN',
    'UNDER_REVIEW',
    'UNDER_REVIEW',
    'ESCALATED',
  ] as const;

  const disputes = [];
  for (let i = 0; i < 5; i++) {
    const txn = disputedTxns[i];
    const buyerForDispute = await prisma.user.findUnique({ where: { id: txn.buyerId } });

    const dispute = await prisma.dispute.create({
      data: {
        transactionId: txn.id,
        filedById: txn.buyerId,
        reason: disputeReasons[i],
        description: disputeDescriptions[i],
        status: disputeStatuses[i],
        resolvedById: disputeStatuses[i] === 'ESCALATED' ? admin1.id : undefined,
        resolutionNote: disputeStatuses[i] === 'ESCALATED'
          ? 'Escalated to senior team for further investigation. Complex case.'
          : undefined,
      },
    });
    disputes.push(dispute);

    // Add buyer evidence to all disputes
    await prisma.disputeEvidence.create({
      data: {
        disputeId: dispute.id,
        submittedById: txn.buyerId,
        content: `Evidence from buyer: Screenshots and communications showing the issue. ${disputeDescriptions[i]}`,
      },
    });

    // Add provider counter-evidence to disputes 2, 3, 4
    if (i >= 2) {
      await prisma.disputeEvidence.create({
        data: {
          disputeId: dispute.id,
          submittedById: txn.providerId,
          content: `Provider response: The work was delivered as specified. Attaching original brief and delivery confirmation for reference.`,
        },
      });
    }

    // Add admin evidence to escalated dispute
    if (disputeStatuses[i] === 'ESCALATED') {
      await prisma.disputeEvidence.create({
        data: {
          disputeId: dispute.id,
          submittedById: admin1.id,
          content: 'Admin note: Both parties have submitted conflicting evidence. Escalating to senior review team for final determination.',
        },
      });
    }
  }

  // Also create resolved disputes for the REFUNDED transactions
  const refundedTxns = allTxns.filter((t: any) => t.status === 'REFUNDED');
  for (let i = 0; i < refundedTxns.length; i++) {
    const txn = refundedTxns[i];
    await prisma.dispute.create({
      data: {
        transactionId: txn.id,
        filedById: txn.buyerId,
        reason: 'QUALITY_ISSUE',
        description: 'Quality of deliverable was unacceptable. Files were corrupted and unusable.',
        status: 'RESOLVED_REFUNDED',
        resolvedById: admin1.id,
        resolutionNote: 'Buyer evidence confirms deliverable is unsuitable. Full refund issued.',
        resolvedAt: ago(120 + i * 24),
      },
    });
  }

  console.log(`Created ${disputes.length + refundedTxns.length} disputes with evidence`);

  // ─── Payouts ─────────────────────────────────────────────────────────────

  const paidOutTxns = allTxns.filter((t: any) => t.status === 'PAID_OUT');
  const releasedTxns = allTxns.filter((t: any) => t.status === 'RELEASED');

  // PAID payouts for PAID_OUT transactions
  for (let i = 0; i < paidOutTxns.length; i++) {
    const txn = paidOutTxns[i];
    const provIdx = txn.providerId === providers[0].id ? 0 : 1;
    await prisma.payout.create({
      data: {
        transactionId: txn.id,
        connectedAccountId: onboardedAccounts[provIdx].id,
        stripePayoutId: mockId('po'),
        amount: txn.providerAmount,
        status: 'PAID',
        paidAt: txn.paidOutAt,
      },
    });
  }

  // PENDING and IN_TRANSIT payouts for RELEASED transactions
  for (let i = 0; i < releasedTxns.length; i++) {
    const txn = releasedTxns[i];
    const provIdx = txn.providerId === providers[0].id ? 0 : 1;
    await prisma.payout.create({
      data: {
        transactionId: txn.id,
        connectedAccountId: onboardedAccounts[provIdx].id,
        stripePayoutId: mockId('po'),
        amount: txn.providerAmount,
        status: i < 3 ? 'PENDING' : 'IN_TRANSIT',
      },
    });
  }

  console.log(`Created ${paidOutTxns.length + releasedTxns.length} payouts`);

  // ─── Webhook Logs ─────────────────────────────────────────────────────────

  const webhookTypes = [
    'payment_intent.succeeded',
    'payment_intent.created',
    'charge.succeeded',
    'transfer.created',
    'payout.paid',
    'account.updated',
    'payment_intent.payment_failed',
    'charge.refunded',
  ];

  const webhookStatuses = [
    'PROCESSED', 'PROCESSED', 'PROCESSED', 'PROCESSED',
    'PROCESSED', 'PROCESSED', 'FAILED', 'SKIPPED',
    'PROCESSED', 'PROCESSED', 'PROCESSED', 'PROCESSING',
  ] as const;

  for (let i = 0; i < 12; i++) {
    await prisma.webhookLog.create({
      data: {
        stripeEventId: `evt_mock_seed_${i + 1}`,
        eventType: webhookTypes[i % webhookTypes.length],
        status: webhookStatuses[i],
        payload: {
          id: `evt_mock_seed_${i + 1}`,
          type: webhookTypes[i % webhookTypes.length],
          data: { object: { id: mockId('obj') } },
        },
        processedAt: webhookStatuses[i] === 'PROCESSED' ? ago(i * 12) : undefined,
        errorMessage: webhookStatuses[i] === 'FAILED'
          ? 'No matching transaction found for payment intent'
          : undefined,
        createdAt: ago(i * 12 + 1),
      },
    });
  }

  console.log('Created 12 webhook log entries');

  // ─── Summary ─────────────────────────────────────────────────────────────

  console.log('\n=== Seed Summary ===');
  console.log(`Users: ${buyers.length} buyers + ${providers.length} providers + 2 admins = ${buyers.length + providers.length + 2}`);
  console.log(`Transactions: ${allTxns.length} total`);
  console.log(`  CREATED: 8, PAYMENT_HELD: 6, DELIVERED: 8, RELEASED: 6`);
  console.log(`  PAID_OUT: 8, DISPUTED: 5, REFUNDED: 4, EXPIRED: 3, CANCELLED: 2`);
  console.log(`Disputes: ${disputes.length + refundedTxns.length} (5 active + ${refundedTxns.length} resolved)`);
  console.log(`Payouts: ${paidOutTxns.length + releasedTxns.length}`);
  console.log(`Webhook logs: 12`);
  console.log('\n=== Login Credentials ===');
  console.log('Buyer:    alice.buyer@demo.com / DemoPass123');
  console.log('Provider: dave.provider@demo.com / DemoPass123');
  console.log('Admin:    admin@demo.com / AdminPass123');
  console.log('\nSeed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
