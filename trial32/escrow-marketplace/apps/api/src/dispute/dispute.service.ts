// [TRACED:EM-AC-003] Dispute CRUD with tenant isolation
// [TRACED:EM-AC-004] Dispute state machine validation
// [TRACED:EM-PV-002] Dispute state machine
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DisputeStatus } from '@prisma/client';
import { validateTransition, DISPUTE_TRANSITIONS } from '@escrow-marketplace/shared';

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { reason: string; transactionId: string; filedById: string; tenantId: string }) {
    return this.prisma.dispute.create({ data });
  }

  async findAll(tenantId: string) {
    return this.prisma.dispute.findMany({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: querying by id + tenantId for tenant isolation
    const dispute = await this.prisma.dispute.findFirst({
      where: { id, tenantId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async transition(id: string, tenantId: string, newStatus: DisputeStatus, resolution?: string) {
    const dispute = await this.findOne(id, tenantId);

    try {
      validateTransition(dispute.status, newStatus, DISPUTE_TRANSITIONS);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid transition';
      throw new BadRequestException(message);
    }

    const updateData: Record<string, unknown> = { status: newStatus };
    if (resolution) {
      updateData.resolution = resolution;
    }

    return this.prisma.dispute.update({ where: { id }, data: updateData });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dispute.delete({ where: { id } });
  }
}
