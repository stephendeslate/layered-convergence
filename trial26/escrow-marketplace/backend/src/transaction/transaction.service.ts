// [TRACED:EM-010] User context via $executeRaw with Prisma.sql
// [TRACED:EM-030] set_config with Prisma.sql tagged templates
// [TRACED:EM-001] Transaction state machine PENDING->FUNDED->RELEASED->COMPLETED/REFUNDED
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { Prisma } from "@prisma/client";

// [TRACED:BE-003] Transaction service with state machine
// [TRACED:SEC-005] $executeRaw with Prisma.sql in PRODUCTION code
@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  // Transaction state machine: PENDING -> FUNDED -> RELEASED -> COMPLETED/REFUNDED
  // [TRACED:BE-004] Transaction state transitions
  private readonly validTransitions: Record<string, string[]> = {
    PENDING: ["FUNDED"],
    FUNDED: ["RELEASED", "REFUNDED"],
    RELEASED: ["COMPLETED"],
    COMPLETED: [],
    REFUNDED: [],
  };

  async setUserContext(userId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_user_id', ${userId}, true)`
    );
  }

  async createTransaction(buyerId: string, sellerId: string, amount: number, description?: string) {
    return this.prisma.transaction.create({
      data: {
        buyerId,
        sellerId,
        amount: new Prisma.Decimal(amount),
        description,
        status: "PENDING",
      },
    });
  }

  async transitionTransaction(transactionId: string, newStatus: string) {
    // findFirst justified: looking up transaction by unique ID for state transition
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new BadRequestException("Transaction not found");
    }

    const allowed = this.validTransitions[transaction.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${transaction.status} to ${newStatus}`
      );
    }

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: newStatus as "PENDING" | "FUNDED" | "RELEASED" | "COMPLETED" | "REFUNDED" },
    });
  }

  async getTransactionsByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: { disputes: true, payouts: true },
    });
  }
}
