import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: string, query: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (role === UserRole.PROVIDER) {
      where.providerId = userId;
    } else if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized');
    }

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.payout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          transaction: true,
          provider: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.payout.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string, role: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        transaction: true,
        provider: { select: { id: true, name: true, email: true } },
      },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (role !== UserRole.ADMIN && payout.providerId !== userId) {
      throw new ForbiddenException('Not authorized to view this payout');
    }

    return payout;
  }
}
