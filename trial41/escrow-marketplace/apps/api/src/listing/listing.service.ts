// TRACED:EM-LISTING-01 listing service with Prisma select optimization
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { normalizePageParams } from '@em/shared';

const listingSelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  status: true,
  sellerId: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  seller: { select: { id: true, email: true } },
} as const;

@Injectable()
export class ListingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateListingDto, sellerId: string) {
    return this.prisma.listing.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        sellerId,
        tenantId: dto.tenantId,
      },
      select: listingSelect,
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { tenantId },
        select: listingSelect,
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where: { tenantId } }),
    ]);
    return {
      data,
      meta: { page: p, pageSize: ps, total, totalPages: Math.ceil(total / ps) },
    };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for RLS compliance
    const listing = await this.prisma.listing.findFirst({
      where: { id, tenantId },
      select: listingSelect,
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async update(id: string, tenantId: string, dto: UpdateListingDto) {
    await this.findOne(id, tenantId);
    return this.prisma.listing.update({
      where: { id },
      data: dto,
      select: listingSelect,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.listing.delete({ where: { id } });
  }
}
