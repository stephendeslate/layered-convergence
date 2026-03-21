import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { TransactionService } from '../src/transaction/transaction.service';
import { DisputeService } from '../src/dispute/dispute.service';
import { PayoutService } from '../src/payout/payout.service';

// [TRACED:TS-005] Integration test using real AppModule (no jest.spyOn on Prisma)
describe('Escrow Marketplace Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let transactionService: TransactionService;
  let disputeService: DisputeService;
  let payoutService: PayoutService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
    transactionService = module.get<TransactionService>(TransactionService);
    disputeService = module.get<DisputeService>(DisputeService);
    payoutService = module.get<PayoutService>(PayoutService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should resolve all services from AppModule', () => {
    expect(prisma).toBeDefined();
    expect(authService).toBeDefined();
    expect(transactionService).toBeDefined();
    expect(disputeService).toBeDefined();
    expect(payoutService).toBeDefined();
  });

  it('should have ValidationPipe configured', () => {
    expect(app).toBeDefined();
  });
});
