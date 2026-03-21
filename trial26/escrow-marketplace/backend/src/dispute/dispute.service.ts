// [TRACED:EM-002] Dispute workflow OPEN->UNDER_REVIEW->RESOLVED/ESCALATED
// [TRACED:EM-017] Dispute state machine OPEN->UNDER_REVIEW->RESOLVED/ESCALATED
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

// [TRACED:BE-005] Dispute service with state machine
@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  // Dispute: OPEN -> UNDER_REVIEW -> RESOLVED/ESCALATED
  private readonly validTransitions: Record<string, string[]> = {
    OPEN: ["UNDER_REVIEW"],
    UNDER_REVIEW: ["RESOLVED", "ESCALATED"],
    RESOLVED: [],
    ESCALATED: [],
  };

  async fileDispute(transactionId: string, filedBy: string, reason: string) {
    return this.prisma.dispute.create({
      data: { transactionId, filedBy, reason, status: "OPEN" },
    });
  }

  async transitionDispute(disputeId: string, newStatus: string, resolution?: string) {
    // findFirst justified: looking up dispute by unique ID for state transition
    const dispute = await this.prisma.dispute.findFirst({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException("Dispute not found");
    }

    const allowed = this.validTransitions[dispute.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition dispute from ${dispute.status} to ${newStatus}`
      );
    }

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: newStatus as "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "ESCALATED",
        resolution: resolution || dispute.resolution,
      },
    });
  }
}
