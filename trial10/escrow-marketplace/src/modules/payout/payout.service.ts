import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePayoutDto } from './dto/create-payout.dto';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePayoutDto) {
    const simulatedTransferId = `tr_test_${Date.now()}`;

    return this.prisma.payout.create({
      data: {
        userId: dto.userId,
        amount: dto.amount,
        currency: dto.currency ?? 'usd',
        stripeTransferId: simulatedTransferId,
        status: 'processing',
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.payout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.payout.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async complete(id: string) {
    return this.prisma.payout.update({
      where: { id },
      data: { status: 'completed' },
    });
  }

  async fail(id: string) {
    return this.prisma.payout.update({
      where: { id },
      data: { status: 'failed' },
    });
  }
}
