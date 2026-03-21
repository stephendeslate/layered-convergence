import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListingService } from '../listing.service';
import { PrismaService } from '../../prisma.service';

// TRACED: EM-TA-UNIT-002 — Listing service unit tests
describe('ListingService', () => {
  let service: ListingService;
  let prisma: {
    setTenantContext: jest.Mock;
    listing: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      setTenantContext: jest.fn(),
      listing: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), create: jest.fn() },
    };
    const module = await Test.createTestingModule({
      providers: [ListingService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ListingService);
  });

  it('should set tenant context before findAll', async () => {
    await service.findAll('t1');
    expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
  });

  it('should throw NotFoundException when listing not found', async () => {
    prisma.listing.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create listing with slugified title', async () => {
    prisma.listing.create.mockResolvedValue({ id: '1', title: 'Test Item', slug: 'test-item' });
    const result = await service.create('Test Item', 'desc', 99, 't1', 'u1');
    expect(prisma.listing.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: 'test-item' }) }),
    );
    expect(result.slug).toBe('test-item');
  });
});
