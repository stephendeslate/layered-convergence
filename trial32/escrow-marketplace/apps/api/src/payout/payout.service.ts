// [TRACED:EM-AC-005] Payout CRUD with tenant isolation
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { amount: number; currency: string; recipientId: string; transactionId: string; tenantId: string }) {
    return this.prisma.payout.create({ data });
  }

  async findAll(tenantId: string) {
    return this.prisma.payout.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId for tenant isolation
    const payout = await this.prisma.payout.findFirst({ where: { id, tenantId } });
    if (!payout) {
      throw new NotFoundException('Payout not found');
    }
    return payout;
  }

  async markProcessed(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.payout.update({
      where: { id },
      data: { processedAt: new Date() },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.payout.delete({ where: { id } });
  }
}
