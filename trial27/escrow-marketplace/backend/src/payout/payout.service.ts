// [TRACED:EM-006] Payout processing for released transactions
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayout(transactionId: string, recipientId: string, amount: number) {
    return this.prisma.payout.create({
      data: {
        transactionId,
        recipientId,
        amount,
        processedAt: new Date(),
      },
    });
  }

  async findByTransaction(transactionId: string) {
    return this.prisma.payout.findMany({
      where: { transactionId },
    });
  }
}
