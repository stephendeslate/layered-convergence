// [TRACED:SM-003] RLS tenant context setting via PrismaService
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantContextService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sets the RLS tenant context for the current transaction.
   * Uses $executeRaw with tagged template literal — $executeRawUnsafe is BANNED (FM #59).
   */
  async setContext(tenantId: string): Promise<void> {
    await this.prisma.setTenantContext(tenantId);
  }
}
