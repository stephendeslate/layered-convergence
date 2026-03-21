import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, amount: number) {
    return this.prisma.payout.create({
      data: {
        userId,
        amount,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.payout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
