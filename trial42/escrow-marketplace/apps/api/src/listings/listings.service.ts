// TRACED: EM-LSVC-001
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto, UpdateListingDto } from './listings.dto';
import { ListingStatus } from '@prisma/client';
import {
  clampPageSize,
  paginationToSkipTake,
} from '@escrow-marketplace/shared';

@Injectable()
export class ListingsService {
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
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        status: true,
        sellerId: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // TRACED: EM-PAGE-003
  async findAll(page: number = 1, pageSize?: number) {
    const clampedSize = clampPageSize(pageSize);
    const { skip, take } = paginationToSkipTake({
      page,
      pageSize: clampedSize,
    });
    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        skip,
        take,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          status: true,
          sellerId: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count(),
    ]);
    return {
      data,
      meta: {
        page,
        pageSize: clampedSize,
        total,
        totalPages: Math.ceil(total / clampedSize),
      },
    };
  }

  async findOne(id: string) {
    // findFirst: lookup by primary key id, single result expected
    const listing = await this.prisma.listing.findFirst({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        status: true,
        sellerId: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        seller: { select: { id: true, name: true, email: true } },
      },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return listing;
  }

  async update(id: string, dto: UpdateListingDto) {
    await this.findOne(id);
    return this.prisma.listing.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.status !== undefined && {
          status: dto.status as ListingStatus,
        }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        status: true,
        sellerId: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.listing.delete({
      where: { id },
      select: { id: true },
    });
  }
}
