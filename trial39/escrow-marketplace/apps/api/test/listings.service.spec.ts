// TRACED: EM-TEST-002 — Listings service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListingsService } from '../src/listings/listings.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ListingsService', () => {
  let service: ListingsService;
  let prisma: {
    listing: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      listing: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
  });

  describe('create', () => {
    it('should create a listing with a generated slug', async () => {
      const dto = {
        title: 'Vintage Watch',
        description: 'A rare vintage timepiece',
        price: 2500,
        sellerId: 'seller-001',
        tenantId: 'tenant-001',
      };

      prisma.listing.create.mockResolvedValue({
        id: 'listing-001',
        ...dto,
        slug: 'vintage-watch',
        status: 'ACTIVE',
      });

      const result = await service.create(dto);
      expect(result.slug).toBe('vintage-watch');
      expect(prisma.listing.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated listings', async () => {
      const mockListings = [
        { id: 'l1', title: 'Item 1', slug: 'item-1', price: '100.00', status: 'ACTIVE', sellerId: 's1', createdAt: new Date() },
      ];
      prisma.listing.findMany.mockResolvedValue(mockListings);
      prisma.listing.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-001', 1, 20);

      expect(result.data).toEqual(mockListings);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('should use select to avoid over-fetching', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.findAll('tenant-001', 1, 20);

      const findManyArgs = prisma.listing.findMany.mock.calls[0][0];
      expect(findManyArgs.select).toBeDefined();
      expect(findManyArgs.select.description).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return a listing with seller and transactions included', async () => {
      const mockListing = {
        id: 'listing-001',
        title: 'Vintage Watch',
        seller: { id: 's1', name: 'Seller', email: 'seller@test.com' },
        transactions: [],
      };
      prisma.listing.findFirst.mockResolvedValue(mockListing);

      const result = await service.findOne('listing-001', 'tenant-001');
      expect(result.seller).toBeDefined();
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update listing fields and regenerate slug on title change', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing-001', title: 'Old Title' });
      prisma.listing.update.mockResolvedValue({ id: 'listing-001', title: 'New Title', slug: 'new-title' });

      const result = await service.update('listing-001', 'tenant-001', { title: 'New Title' });
      expect(result.slug).toBe('new-title');
    });
  });

  describe('remove', () => {
    it('should delete the listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: 'listing-001' });
      prisma.listing.delete.mockResolvedValue({ id: 'listing-001' });

      const result = await service.remove('listing-001', 'tenant-001');
      expect(prisma.listing.delete).toHaveBeenCalledWith({ where: { id: 'listing-001' } });
      expect(result).toBeDefined();
    });
  });
});
