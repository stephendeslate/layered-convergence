import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { slugify, paginate, DEFAULT_PAGE_SIZE } from '@escrow-marketplace/shared';

// TRACED: EM-FC-LISTING-001 — Listing service with CRUD operations
@Injectable()
export class ListingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const listings = await this.prisma.listing.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return paginate(listings, 1, DEFAULT_PAGE_SIZE);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // findFirst: fetching listing by ID within tenant scope for RLS compliance
    const listing = await this.prisma.listing.findFirst({
      where: { id, tenantId },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return listing;
  }

  // TRACED: EM-CQ-SLUG-002 — slugify used for listing slug generation
  async create(title: string, description: string, price: number, tenantId: string, sellerId: string) {
    await this.prisma.setTenantContext(tenantId);
    const slug = slugify(title);
    return this.prisma.listing.create({
      data: {
        title,
        slug,
        description,
        price,
        tenantId,
        sellerId,
        status: 'DRAFT',
      },
    });
  }
}
