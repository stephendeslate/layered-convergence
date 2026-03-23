// TRACED: EM-ESVC-001
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEscrowDto, UpdateEscrowDto } from './escrows.dto';
import { EscrowStatus } from '@prisma/client';
import { clampPageSize, paginationToSkipTake } from '@escrow-marketplace/shared';

@Injectable()
export class EscrowsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEscrowDto) {
    return this.prisma.escrow.create({
      data: {
        amount: dto.amount,
        balance: dto.balance,
        transactionId: dto.transactionId,
        tenantId: dto.tenantId,
      },
      select: {
        id: true,
        amount: true,
        balance: true,
        status: true,
        transactionId: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(page: number = 1, pageSize?: number) {
    const clampedSize = clampPageSize(pageSize);
    const { skip, take } = paginationToSkipTake({ page, pageSize: clampedSize });
    const [data, total] = await Promise.all([
      this.prisma.escrow.findMany({
        skip,
        take,
        select: {
          id: true,
          amount: true,
          balance: true,
          status: true,
          transactionId: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.escrow.count(),
    ]);
    return {
      data,
      meta: { page, pageSize: clampedSize, total, totalPages: Math.ceil(total / clampedSize) },
    };
  }

  async findOne(id: string) {
    // findFirst: lookup by primary key id, single result expected
    const escrow = await this.prisma.escrow.findFirst({
      where: { id },
      select: {
        id: true,
        amount: true,
        balance: true,
        status: true,
        transactionId: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        transaction: { select: { id: true, status: true, amount: true } },
      },
    });
    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }
    return escrow;
  }

  async update(id: string, dto: UpdateEscrowDto) {
    await this.findOne(id);
    return this.prisma.escrow.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status as EscrowStatus }),
        ...(dto.balance !== undefined && { balance: dto.balance }),
      },
      select: {
        id: true,
        amount: true,
        balance: true,
        status: true,
        transactionId: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.escrow.delete({
      where: { id },
      select: { id: true },
    });
  }
}
