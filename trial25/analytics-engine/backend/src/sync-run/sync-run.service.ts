import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:API-005] SyncRun service with state machine transitions
@Injectable()
export class SyncRunService {
  private readonly logger = new Logger(SyncRunService.name);

  // [TRACED:SA-003] SyncRun state machine transition map
  private readonly validTransitions: Record<string, string[]> = {
    PENDING: ['RUNNING'],
    RUNNING: ['COMPLETED', 'FAILED'],
    COMPLETED: [],
    FAILED: [],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async findAll(pipelineId: string, tenantId: string) {
    await this.tenantContext.setTenantContext(tenantId);
    return this.prisma.syncRun.findMany({
      where: { pipelineId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const syncRun = await this.prisma.syncRun.findUnique({
      where: { id },
      include: { pipeline: true, dataSource: true },
    });
    if (!syncRun) {
      throw new NotFoundException(`SyncRun ${id} not found`);
    }
    return syncRun;
  }

  async create(data: { pipelineId: string; dataSourceId: string }, tenantId: string) {
    await this.tenantContext.setTenantContext(tenantId);
    const syncRun = await this.prisma.syncRun.create({
      data: {
        pipelineId: data.pipelineId,
        dataSourceId: data.dataSourceId,
        status: 'PENDING',
      },
    });
    this.logger.log(`SyncRun created: ${syncRun.id}`);
    return syncRun;
  }

  async transition(id: string, targetStatus: string, errorMessage?: string) {
    const syncRun = await this.findOne(id);
    const allowed = this.validTransitions[syncRun.status] ?? [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition sync run from ${syncRun.status} to ${targetStatus}`,
      );
    }

    const updateData: Record<string, unknown> = {
      status: targetStatus,
    };

    if (targetStatus === 'RUNNING') {
      updateData.startedAt = new Date();
    }
    if (targetStatus === 'COMPLETED' || targetStatus === 'FAILED') {
      updateData.completedAt = new Date();
    }
    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    return this.prisma.syncRun.update({
      where: { id },
      data: updateData,
    });
  }
}
