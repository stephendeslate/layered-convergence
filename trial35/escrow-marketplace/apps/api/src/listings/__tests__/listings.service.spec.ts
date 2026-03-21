// TRACED: EM-TEST-002 — Listings service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListingsService } from '../listings.service';
import { PrismaService } from '../../prisma.service';

describe('ListingsService', () => {
  let service: ListingsService;
  let prisma: { listing: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock } };

  beforeEach(async () => {
    prisma = { listing: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
  });

  describe('create', () => {
    it('should create a listing with generated ID', async () => {
      prisma.listing.create.mockResolvedValue({ id: 'lst_abc12345', title: 'Test' });

      const result = await service.create('tenant-1', 'user-1', { title: 'Test', description: 'Desc', price: '99.99' });

      expect(result.id).toBeDefined();
      const createArg = prisma.listing.create.mock.calls[0][0];
      expect(createArg.data.id).toMatch(/^lst_/);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.listing.findMany.mockResolvedValue([{ id: '1', title: 'Item 1' }]);
      prisma.listing.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return listing with seller info', async () => {
      prisma.listing.findFirst.mockResolvedValue({ id: '1', title: 'Item', seller: { id: 'u1', email: 'a@b.com' } });

      const result = await service.findOne('tenant-1', '1');
      expect(result.title).toBe('Item');
    });

    it('should throw NotFoundException when listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);
      await expect(service.findOne('tenant-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
