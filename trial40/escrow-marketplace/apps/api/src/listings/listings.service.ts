// TRACED: EM-API-004 — Listings service with CRUD operations
// TRACED: EM-DB-003 — Prisma select for optimized list queries
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { paginate, slugify } from '@escrow-marketplace/shared';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateListingDto) {
    const slug = slugify(dto.title);

    return this.prisma.listing.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        sellerId: dto.sellerId,
        tenantId: dto.tenantId,
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { tenantId },
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          status: true,
          sellerId: true,
          createdAt: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where: { tenantId } }),
    ]);

    return paginate(data, total, page, pageSize);
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: tenant-scoped single record lookup
    const listing = await this.prisma.listing.findFirst({
      where: { id, tenantId },
      include: {
        seller: {
          select: { id: true, name: true, email: true },
        },
        transactions: {
          select: { id: true, amount: true, status: true, createdAt: true },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  async update(id: string, tenantId: string, dto: UpdateListingDto) {
    const listing = await this.findOne(id, tenantId);

    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) {
      updateData.title = dto.title;
      updateData.slug = slugify(dto.title);
    }
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = new Prisma.Decimal(dto.price);
    if (dto.status !== undefined) updateData.status = dto.status;

    return this.prisma.listing.update({
      where: { id: listing.id },
      data: updateData,
    });
  }

  async remove(id: string, tenantId: string) {
    const listing = await this.findOne(id, tenantId);

    return this.prisma.listing.delete({
      where: { id: listing.id },
    });
  }
}
