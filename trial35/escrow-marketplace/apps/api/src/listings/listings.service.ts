// TRACED: EM-LIST-003 — Listings service with generateId
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { paginate, generateId } from '@escrow-marketplace/shared';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, sellerId: string, data: { title: string; description: string; price: string }) {
    return this.prisma.listing.create({
      data: {
        id: generateId('lst'),
        title: data.title,
        description: data.description,
        price: data.price,
        status: 'DRAFT',
        tenantId,
        sellerId,
      },
    });
  }

  async findAll(tenantId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { tenantId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where: { tenantId } }),
    ]);
    return paginate(items, total, page, pageSize);
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scoping by tenantId for RLS — listing ID alone insufficient
    const listing = await this.prisma.listing.findFirst({
      where: { id, tenantId },
      include: { seller: { select: { id: true, email: true } } },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }
}
