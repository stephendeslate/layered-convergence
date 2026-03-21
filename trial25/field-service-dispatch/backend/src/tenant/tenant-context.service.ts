// [TRACED:SEC-004] TenantContextService uses $executeRaw with Prisma.sql for RLS context
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TenantContextService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(userId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.user_id', ${userId}, true)`,
    );
  }
}
