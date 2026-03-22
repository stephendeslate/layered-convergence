import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ListingsService } from '../src/listings/listings.service';
import { PrismaService } from '../src/prisma.service';

// TRACED: EM-TEST-001 — Unit tests for listings service

describe('ListingsService', () => {
  let service: ListingsService;
  let prisma: {
    listing: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
  };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';
  const sellerUser = { sub: 'seller-id', role: 'SELLER', tenantId };
  const buyerUser = { sub: 'buyer-id', role: 'BUYER', tenantId };

  beforeEach(async () => {
    prisma = {
      listing: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
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

  describe('findAll', () => {
    it('should return paginated listings', async () => {
      const listings = [
        { id: '1', title: 'Item 1', price: '100.00' },
        { id: '2', title: 'Item 2', price: '200.00' },
      ];
      prisma.listing.findMany.mockResolvedValue(listings);
      prisma.listing.count.mockResolvedValue(2);

      const result = await service.findAll(tenantId, 1, 20);

      expect(result.data).toEqual(listings);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should cap pageSize at MAX_PAGE_SIZE', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.findAll(tenantId, 1, 500);

      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a listing', async () => {
      const listing = { id: '1', title: 'Item', tenantId };
      prisma.listing.findFirst.mockResolvedValue(listing);

      const result = await service.findOne('1', tenantId);
      expect(result).toEqual(listing);
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', tenantId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      title: 'New Item',
      description: 'A great item',
      price: 99.99,
    };

    it('should create a listing for SELLER role', async () => {
      prisma.listing.create.mockResolvedValue({
        id: 'new-id',
        ...createDto,
        status: 'ACTIVE',
        sellerId: sellerUser.sub,
        tenantId,
      });

      const result = await service.create(createDto, sellerUser);
      expect(result.status).toBe('ACTIVE');
      expect(result.sellerId).toBe(sellerUser.sub);
    });

    it('should throw ForbiddenException for BUYER role', async () => {
      await expect(service.create(createDto, buyerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should sanitize title and description', async () => {
      prisma.listing.create.mockResolvedValue({ id: 'id' });

      await service.create(
        {
          title: '<b>Bold</b> Title',
          description: '<script>hack</script>Safe text',
          price: 10,
        },
        sellerUser,
      );

      expect(prisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Bold Title',
            description: 'hackSafe text',
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update own listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: '1',
        sellerId: sellerUser.sub,
        tenantId,
      });
      prisma.listing.update.mockResolvedValue({ id: '1', title: 'Updated' });

      const result = await service.update('1', { title: 'Updated' }, sellerUser);
      expect(result.title).toBe('Updated');
    });

    it('should throw ForbiddenException for non-owner non-manager', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: '1',
        sellerId: 'other-seller',
        tenantId,
      });

      await expect(
        service.update('1', { title: 'Hack' }, buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
