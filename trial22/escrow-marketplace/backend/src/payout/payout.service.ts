// TRACED:AC-008 — GET /payouts returns user's payouts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.payout.findMany({
      where: { recipientId: userId },
      include: { transaction: true },
      orderBy: { paidAt: 'desc' },
    });
  }
}
