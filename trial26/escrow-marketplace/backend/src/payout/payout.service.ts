// [TRACED:EM-003] Payout states PENDING->PROCESSING->COMPLETED/FAILED
// [TRACED:EM-018] Payout Decimal(12,2) precision
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { Prisma } from "@prisma/client";

// [TRACED:BE-006] Payout service with state machine
@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  // Payout: PENDING -> PROCESSING -> COMPLETED/FAILED
  private readonly validTransitions: Record<string, string[]> = {
    PENDING: ["PROCESSING"],
    PROCESSING: ["COMPLETED", "FAILED"],
    COMPLETED: [],
    FAILED: [],
  };

  async createPayout(transactionId: string, amount: number) {
    return this.prisma.payout.create({
      data: {
        transactionId,
        amount: new Prisma.Decimal(amount),
        status: "PENDING",
      },
    });
  }

  async transitionPayout(payoutId: string, newStatus: string, failureReason?: string) {
    // findFirst justified: looking up payout by unique ID for state transition
    const payout = await this.prisma.payout.findFirst({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new BadRequestException("Payout not found");
    }

    const allowed = this.validTransitions[payout.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition payout from ${payout.status} to ${newStatus}`
      );
    }

    return this.prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: newStatus as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
        processedAt: ["COMPLETED", "FAILED"].includes(newStatus) ? new Date() : undefined,
        failureReason,
      },
    });
  }
}
