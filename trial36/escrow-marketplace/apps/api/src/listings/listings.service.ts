import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateListingDto, UpdateListingDto } from './dto';
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  paginate,
  sanitizeInput,
} from '@escrow-marketplace/shared';

interface RequestUser {
  sub: string;
  role: string;
  tenantId: string;
}

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE,
  ) {
    const take = Math.min(pageSize, MAX_PAGE_SIZE);
    const skip = (page - 1) * take;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { tenantId, status: 'ACTIVE' },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
  async create(dto: CreateListingDto, user: RequestUser) {
    if (user.role !== 'SELLER' && user.role !== 'MANAGER') {
      throw new ForbiddenException('Only sellers and managers can create listings');
    }

    const sanitizedTitle = sanitizeInput(dto.title);
    const sanitizedDescription = sanitizeInput(dto.description);

    return this.prisma.listing.create({
      data: {
        title: sanitizedTitle,
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
    if (dto.title !== undefined) data.title = sanitizeInput(dto.title);
    if (dto.description !== undefined) data.description = sanitizeInput(dto.description);
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.listing.update({
      where: { id },
      data,
    });
  }
}
