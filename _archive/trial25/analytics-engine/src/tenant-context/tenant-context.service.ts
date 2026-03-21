import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TenantContextService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
  }

  async getTenantContext(): Promise<string | null> {
    const result = await this.prisma.$queryRaw<
      Array<{ current_setting: string }>
    >(Prisma.sql`SELECT current_setting('app.current_tenant_id', true)`);
    return result[0]?.current_setting || null;
  }
}
