// TRACED: EM-TLST-001
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
    it('should create a listing', async () => {
      const mockListing = {
        id: '1',
        title: 'Test',
        description: 'Desc',
        price: 100,
        status: 'DRAFT',
        sellerId: 'user-1',
        tenantId: 'tenant-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.listing.create.mockResolvedValue(mockListing);

      const result = await service.create(
        { title: 'Test', description: 'Desc', price: 100, tenantId: 'tenant-1' },
        'user-1',
      );
      expect(result.title).toBe('Test');
    });
  });

  describe('findAll', () => {
    it('should return paginated listings', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      const result = await service.findAll(1, 10);
      expect(result.data).toEqual([]);
      expect(result.meta.page).toBe(1);
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      prisma.listing.findMany.mockResolvedValue([]);
      prisma.listing.count.mockResolvedValue(0);

      const result = await service.findAll(1, 500);
      expect(result.meta.pageSize).toBe(100);
    });
  });

  describe('findOne', () => {
    it('should return a listing by id', async () => {
      const mockListing = { id: '1', title: 'Test' };
      prisma.listing.findFirst.mockResolvedValue(mockListing);

      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: '1' });
      prisma.listing.update.mockResolvedValue({ id: '1', title: 'Updated' });

      const result = await service.update('1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: '1' });
      prisma.listing.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');
      expect(result.id).toBe('1');
    });
  });
});
