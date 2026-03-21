// [TRACED:AE-SM-007] TenantContextService sets RLS variable via $executeRaw with Prisma.sql
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TenantContextService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`,
    );
  }
}
