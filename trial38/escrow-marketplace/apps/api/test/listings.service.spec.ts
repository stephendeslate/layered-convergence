import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ListingsService } from '../src/listings/listings.service';
import { PrismaService } from '../src/prisma/prisma.service';

// TRACED: EM-TEST-001 — Unit tests for listings service

describe('ListingsService', () => {
  let service: ListingsService;
  let prisma: {
    listing: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      listing: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
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

  describe('findAll', () => {
    it('should return paginated listings with select optimization', async () => {
      const mockListings = [
        { id: '1', title: 'Test', slug: 'test', status: 'ACTIVE' },
      ];
      prisma.listing.findMany.mockResolvedValue(mockListings);
      prisma.listing.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1');

      expect(result.data).toEqual(mockListings);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            title: true,
            slug: true,
          }),
        }),
      );
    });

    it('should respect MAX_PAGE_SIZE limit via clampPageSize', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      await service.findAll('tenant-1', 1, 500);

      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a listing by id and tenantId', async () => {
      const mockListing = { id: '1', title: 'Test', slug: 'test', tenantId: 'tenant-1' };
      prisma.listing.findFirst.mockResolvedValue(mockListing);

      const result = await service.findOne('1', 'tenant-1');

      expect(result).toEqual(mockListing);
    });

    it('should throw NotFoundException if listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      title: 'New Listing',
      description: 'A great item',
      price: 99.99,
    };

    const sellerUser = { sub: 'seller-1', role: 'SELLER', tenantId: 'tenant-1' };

    it('should create a listing with slug for sellers', async () => {
      prisma.listing.create.mockResolvedValue({
        id: '1',
        ...createDto,
        slug: 'new-listing',
        status: 'ACTIVE',
      });

      const result = await service.create(createDto, sellerUser);

      expect(result.slug).toBe('new-listing');
      expect(prisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'new-listing',
          }),
        }),
      );
    });

    it('should throw ForbiddenException for BUYER role', async () => {
      const buyerUser = { sub: 'buyer-1', role: 'BUYER', tenantId: 'tenant-1' };

      await expect(service.create(createDto, buyerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow MANAGER role to create listings', async () => {
      const managerUser = { sub: 'mgr-1', role: 'MANAGER', tenantId: 'tenant-1' };
      prisma.listing.create.mockResolvedValue({ id: '1', ...createDto, slug: 'new-listing' });

      await service.create(createDto, managerUser);

      expect(prisma.listing.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a listing owned by the user', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: '1',
        sellerId: 'seller-1',
        tenantId: 'tenant-1',
      });
      prisma.listing.update.mockResolvedValue({ id: '1', title: 'Updated' });

      const result = await service.update(
        '1',
        { title: 'Updated' },
        { sub: 'seller-1', role: 'SELLER', tenantId: 'tenant-1' },
      );

      expect(result.title).toBe('Updated');
    });

    it('should throw ForbiddenException for non-owner non-manager', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: '1',
        sellerId: 'seller-1',
        tenantId: 'tenant-1',
      });

      await expect(
        service.update(
          '1',
          { title: 'Updated' },
          { sub: 'other-user', role: 'SELLER', tenantId: 'tenant-1' },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow MANAGER to update any listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: '1',
        sellerId: 'seller-1',
        tenantId: 'tenant-1',
      });
      prisma.listing.update.mockResolvedValue({ id: '1', title: 'Manager Updated' });

      const result = await service.update(
        '1',
        { title: 'Manager Updated' },
        { sub: 'mgr-1', role: 'MANAGER', tenantId: 'tenant-1' },
      );

      expect(result.title).toBe('Manager Updated');
    });
  });

  describe('remove', () => {
    it('should delete a listing owned by the user', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: '1',
        sellerId: 'seller-1',
        tenantId: 'tenant-1',
      });
      prisma.listing.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', { sub: 'seller-1', role: 'SELLER', tenantId: 'tenant-1' });

      expect(result).toEqual({ id: '1' });
    });

    it('should throw ForbiddenException for non-owner', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: '1',
        sellerId: 'seller-1',
        tenantId: 'tenant-1',
      });

      await expect(
        service.remove('1', { sub: 'other', role: 'BUYER', tenantId: 'tenant-1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
