// TRACED: EM-TEST-002 — Listings service unit tests
import { ListingsService } from '../src/listings/listings.service';

describe('ListingsService', () => {
  let listingsService: ListingsService;
  let mockPrisma: Record<string, unknown>;

  beforeEach(() => {
    mockPrisma = {
      listing: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    listingsService = new ListingsService(mockPrisma as never);
  });

  it('should be defined', () => {
    expect(listingsService).toBeDefined();
  });

  it('should create a listing with slug', async () => {
    const mockListing = {
      id: '1',
      title: 'Test Listing',
      slug: 'test-listing',
      price: '100.00',
    };
    (mockPrisma.listing as Record<string, jest.Mock>).create.mockResolvedValue(mockListing);

    const result = await listingsService.create({
      title: 'Test Listing',
      description: 'A test listing',
      price: 100,
      sellerId: 'seller-1',
      tenantId: 'tenant-1',
    });

    expect(result).toEqual(mockListing);
  });

  it('should return paginated listings', async () => {
    const mockListings = [{ id: '1', title: 'Test' }];
    (mockPrisma.listing as Record<string, jest.Mock>).findMany.mockResolvedValue(mockListings);
    (mockPrisma.listing as Record<string, jest.Mock>).count.mockResolvedValue(1);

    const result = await listingsService.findAll('tenant-1', 1, 20);

    expect(result.data).toEqual(mockListings);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('should throw NotFoundException for missing listing', async () => {
    (mockPrisma.listing as Record<string, jest.Mock>).findFirst.mockResolvedValue(null);

    await expect(
      listingsService.findOne('nonexistent', 'tenant-1'),
    ).rejects.toThrow('Listing not found');
  });
});
