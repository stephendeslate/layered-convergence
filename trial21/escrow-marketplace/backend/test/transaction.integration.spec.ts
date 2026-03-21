import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { TransactionService } from '../src/transaction/transaction.service';
import { DisputeService } from '../src/dispute/dispute.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role, TransactionStatus } from '@prisma/client';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

// [TRACED:TS-006] Integration tests for transaction state machine with real database
describe('TransactionService (integration)', () => {
  let module: TestingModule;
  let authService: AuthService;
  let transactionService: TransactionService;
  let disputeService: DisputeService;
  let prisma: PrismaService;
  let buyerId: string;
  let sellerId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    transactionService = module.get<TransactionService>(TransactionService);
    disputeService = module.get<DisputeService>(DisputeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.webhook.deleteMany();
    await prisma.user.deleteMany();

    const buyer = await authService.register({
      email: 'buyer@txn.test',
      password: 'securePass123',
      role: Role.BUYER,
    });
    buyerId = buyer.user.id;

    const seller = await authService.register({
      email: 'seller@txn.test',
      password: 'securePass123',
      role: Role.SELLER,
    });
    sellerId = seller.user.id;
  });

  it('should create a transaction as buyer', async () => {
    const tx = await transactionService.create(buyerId, Role.BUYER, {
      sellerId,
      amount: 250.00,
      description: 'Test product',
    });

    expect(tx.buyerId).toBe(buyerId);
    expect(tx.sellerId).toBe(sellerId);
    expect(tx.status).toBe(TransactionStatus.PENDING);
  });

  it('should reject seller creating a transaction', async () => {
    await expect(
      transactionService.create(sellerId, Role.SELLER, {
        sellerId: buyerId,
        amount: 100,
        description: 'Invalid',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should follow the state machine: PENDING -> FUNDED -> SHIPPED -> DELIVERED', async () => {
    const tx = await transactionService.create(buyerId, Role.BUYER, {
      sellerId,
      amount: 100,
      description: 'State machine test',
    });

    const funded = await transactionService.updateStatus(buyerId, Role.BUYER, tx.id, {
      status: TransactionStatus.FUNDED,
    });
    expect(funded.status).toBe(TransactionStatus.FUNDED);

    const shipped = await transactionService.updateStatus(sellerId, Role.SELLER, tx.id, {
      status: TransactionStatus.SHIPPED,
    });
    expect(shipped.status).toBe(TransactionStatus.SHIPPED);

    const delivered = await transactionService.updateStatus(buyerId, Role.BUYER, tx.id, {
      status: TransactionStatus.DELIVERED,
    });
    expect(delivered.status).toBe(TransactionStatus.DELIVERED);
  });

  it('should reject invalid state transitions', async () => {
    const tx = await transactionService.create(buyerId, Role.BUYER, {
      sellerId,
      amount: 100,
      description: 'Invalid transition test',
    });

    await expect(
      transactionService.updateStatus(sellerId, Role.SELLER, tx.id, {
        status: TransactionStatus.SHIPPED,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should support dispute flow: FUNDED -> DISPUTED', async () => {
    const tx = await transactionService.create(buyerId, Role.BUYER, {
      sellerId,
      amount: 100,
      description: 'Dispute test',
    });

    await transactionService.updateStatus(buyerId, Role.BUYER, tx.id, {
      status: TransactionStatus.FUNDED,
    });

    const dispute = await disputeService.create(buyerId, Role.BUYER, {
      transactionId: tx.id,
      reason: 'Not as described',
    });

    expect(dispute.reason).toBe('Not as described');

    const updatedTx = await transactionService.findOne(buyerId, tx.id);
    expect(updatedTx.status).toBe(TransactionStatus.DISPUTED);
  });

  it('should list transactions for a user', async () => {
    await transactionService.create(buyerId, Role.BUYER, {
      sellerId,
      amount: 50,
      description: 'List test 1',
    });
    await transactionService.create(buyerId, Role.BUYER, {
      sellerId,
      amount: 75,
      description: 'List test 2',
    });

    const buyerTxns = await transactionService.findAll(buyerId);
    expect(buyerTxns.length).toBe(2);

    const sellerTxns = await transactionService.findAll(sellerId);
    expect(sellerTxns.length).toBe(2);
  });
});
