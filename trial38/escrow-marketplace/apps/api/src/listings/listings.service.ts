import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  paginate,
  sanitizeInput,
  slugify,
  clampPageSize,
} from '@escrow-marketplace/shared';

interface RequestUser {
  sub: string;
  role: string;
  tenantId: string;
}

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  // TRACED: EM-PERF-005 — Prisma query optimization: list queries use select
  async findAll(
    tenantId: string,
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE,
  ) {
    const take = clampPageSize(pageSize, MAX_PAGE_SIZE);
    const skip = (page - 1) * take;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { tenantId, status: 'ACTIVE' },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          price: true,
          status: true,
          sellerId: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.listing.count({
        where: { tenantId, status: 'ACTIVE' },
      }),
    ]);

    return paginate(listings, total, page, take);
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: filtering by both id and tenantId for RLS-compatible lookup
    const listing = await this.prisma.listing.findFirst({
      where: { id, tenantId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  // TRACED: EM-API-003 — Role-based access control on listing creation
  // TRACED: EM-API-009 — Slug generation for listings
  async create(dto: CreateListingDto, user: RequestUser) {
    if (user.role !== 'SELLER' && user.role !== 'MANAGER') {
      throw new ForbiddenException('Only sellers and managers can create listings');
    }

    const sanitizedTitle = sanitizeInput(dto.title);
    const sanitizedDescription = sanitizeInput(dto.description);
    const slug = slugify(sanitizedTitle);

    return this.prisma.listing.create({
      data: {
        title: sanitizedTitle,
        slug,
        description: sanitizedDescription,
        price: dto.price,
        status: 'ACTIVE',
        sellerId: user.sub,
        tenantId: user.tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateListingDto, user: RequestUser) {
    // findFirst: checking ownership with tenantId for RLS compliance
    const listing = await this.prisma.listing.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // TRACED: EM-API-008 — Listing owner or manager authorization
    if (listing.sellerId !== user.sub && user.role !== 'MANAGER') {
      throw new ForbiddenException('Not authorized to update this listing');
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) {
      data.title = sanitizeInput(dto.title);
      data.slug = slugify(sanitizeInput(dto.title));
    }
    if (dto.description !== undefined) data.description = sanitizeInput(dto.description);
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.listing.update({
      where: { id },
      data,
    });
  }

  // TRACED: EM-API-010 — Delete listing with tenant/owner validation
  async remove(id: string, user: RequestUser) {
    // findFirst: checking ownership with tenantId for RLS compliance
    const listing = await this.prisma.listing.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== user.sub && user.role !== 'MANAGER') {
      throw new ForbiddenException('Not authorized to delete this listing');
    }

    return this.prisma.listing.delete({
      where: { id },
    });
  }
}
