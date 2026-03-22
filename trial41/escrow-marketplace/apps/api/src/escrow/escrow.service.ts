// TRACED:EM-ESCROW-01 escrow service with Decimal money handling
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { UpdateEscrowDto } from './dto/update-escrow.dto';
import { normalizePageParams } from '@em/shared';

const escrowSelect = {
  id: true,
  amount: true,
  balance: true,
  status: true,
  transactionId: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  transaction: { select: { id: true, status: true, amount: true } },
} as const;

@Injectable()
export class EscrowService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEscrowDto) {
    return this.prisma.escrow.create({
      data: {
        amount: dto.amount,
        balance: dto.balance,
        transactionId: dto.transactionId,
        tenantId: dto.tenantId,
      },
      select: escrowSelect,
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = normalizePageParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.escrow.findMany({
        where: { tenantId },
        select: escrowSelect,
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.escrow.count({ where: { tenantId } }),
    ]);
    return {
      data,
      meta: { page: p, pageSize: ps, total, totalPages: Math.ceil(total / ps) },
    };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for tenant isolation
    const escrow = await this.prisma.escrow.findFirst({
      where: { id, tenantId },
      select: escrowSelect,
    });
    if (!escrow) throw new NotFoundException('Escrow not found');
    return escrow;
  }

  async update(id: string, tenantId: string, dto: UpdateEscrowDto) {
    await this.findOne(id, tenantId);
    return this.prisma.escrow.update({
      where: { id },
      data: dto,
      select: escrowSelect,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.escrow.delete({ where: { id } });
  }
}
