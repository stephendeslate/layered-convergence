// [TRACED:EM-005] Dispute management with resolution workflow
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    transactionId: string;
    filedBy: string;
    reason: string;
  }) {
    return this.prisma.dispute.create({
      data: {
        transactionId: data.transactionId,
        filedBy: data.filedBy,
        reason: data.reason,
      },
    });
  }

  async resolve(disputeId: string, resolution: string, outcome: string) {
    // findFirst: dispute lookup by ID for resolution with potential RLS filtering
    const dispute = await this.prisma.dispute.findFirst({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException("Dispute not found");
    }

    if (dispute.status !== "OPEN" && dispute.status !== "UNDER_REVIEW") {
      throw new BadRequestException("Dispute is already resolved");
    }

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: outcome as "RESOLVED_BUYER" | "RESOLVED_SELLER",
        resolution,
      },
    });
  }
}
