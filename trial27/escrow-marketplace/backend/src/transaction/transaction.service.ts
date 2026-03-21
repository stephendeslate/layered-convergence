// [TRACED:EM-004] Transaction management with state machine transitions
// [TRACED:EM-010] User context set via $executeRaw with Prisma.sql
// [TRACED:EM-029] Parameterized queries via Prisma.sql prevent SQL injection
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { Prisma } from "@prisma/client";

const VALID_TRANSACTION_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["FUNDED"],
  FUNDED: ["DELIVERED", "DISPUTED", "REFUNDED"],
  DELIVERED: ["RELEASED", "DISPUTED"],
  RELEASED: [],
  DISPUTED: ["REFUNDED", "RELEASED"],
  REFUNDED: [],
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async setUserContext(userId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
    );
  }

  async create(data: {
    buyerId: string;
    sellerId: string;
    amount: number;
    description: string;
  }) {
    return this.prisma.transaction.create({
      data: {
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        amount: data.amount,
        description: data.description,
      },
    });
  }

  async transition(transactionId: string, newStatus: string) {
    // findFirst: transaction lookup by ID within user context for RLS compliance
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new BadRequestException("Transaction not found");
    }

    const allowed = VALID_TRANSACTION_TRANSITIONS[transaction.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${transaction.status} to ${newStatus}`,
      );
    }

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: newStatus as
          | "PENDING"
          | "FUNDED"
          | "DELIVERED"
          | "RELEASED"
          | "DISPUTED"
          | "REFUNDED",
      },
    });
  }

  async findByUser(userId: string) {
    await this.setUserContext(userId);
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: { disputes: true },
    });
  }
}
