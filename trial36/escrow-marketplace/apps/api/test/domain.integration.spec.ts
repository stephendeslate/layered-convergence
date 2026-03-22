import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { ListingsService } from '../src/listings/listings.service';
import { TransactionsService } from '../src/transactions/transactions.service';

// TRACED: EM-TEST-002 — Integration tests with real AppModule

describe('Domain Integration', () => {
  let app: INestApplication;
  let listingsService: ListingsService;
  let transactionsService: TransactionsService;

  const mockPrisma = {
    user: { findFirst: jest.fn(), create: jest.fn() },
    listing: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    escrowAccount: { create: jest.fn() },
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    listingsService = moduleFixture.get<ListingsService>(ListingsService);
    transactionsService = moduleFixture.get<TransactionsService>(TransactionsService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have listings service available', () => {
    expect(listingsService).toBeDefined();
  });

  it('should have transactions service available', () => {
    expect(transactionsService).toBeDefined();
  });

  describe('listings and transactions interaction', () => {
    const tenantId = '550e8400-e29b-41d4-a716-446655440000';
    const sellerUser = { sub: 'seller-id', role: 'SELLER', tenantId };

    it('should create a listing via the service', async () => {
      mockPrisma.listing.create.mockResolvedValue({
        id: 'listing-1',
        title: 'Test Item',
        description: 'A test item',
        price: '50.00',
        status: 'ACTIVE',
        sellerId: sellerUser.sub,
        tenantId,
      });

      const listing = await listingsService.create(
        { title: 'Test Item', description: 'A test item', price: 50 },
        sellerUser,
      );

      expect(listing.status).toBe('ACTIVE');
      expect(listing.sellerId).toBe(sellerUser.sub);
    });

    it('should retrieve paginated listings', async () => {
      mockPrisma.listing.findMany.mockResolvedValue([
        { id: '1', title: 'Item 1' },
        { id: '2', title: 'Item 2' },
      ]);
      mockPrisma.listing.count.mockResolvedValue(2);

      const result = await listingsService.findAll(tenantId, 1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.totalPages).toBe(1);
    });

    it('should enforce transaction state machine', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: 'PENDING',
        tenantId,
      });
      mockPrisma.transaction.update.mockResolvedValue({
        id: 'tx-1',
        status: 'DISPUTED',
      });

      const result = await transactionsService.updateStatus(
        'tx-1',
        { status: 'DISPUTED' as const },
        { sub: 'buyer-id', role: 'BUYER', tenantId, email: 'b@example.com' },
      );

      expect(result.status).toBe('DISPUTED');
    });
  });
});
