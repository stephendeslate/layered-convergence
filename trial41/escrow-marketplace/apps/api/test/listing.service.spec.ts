// TRACED:EM-TEST-03 listing service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListingService } from '../src/listing/listing.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ListingService', () => {
  let service: ListingService;

  const mockPrisma = {
    listing: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ListingService>(ListingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException when listing not found', async () => {
    mockPrisma.listing.findFirst.mockResolvedValue(null);
    await expect(service.findOne('fake-id', 'tenant-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return paginated listings', async () => {
    mockPrisma.listing.findMany.mockResolvedValue([]);
    mockPrisma.listing.count.mockResolvedValue(0);
    const result = await service.findAll('tenant-1', 1, 10);
    expect(result.meta).toEqual({
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
    });
  });
});
