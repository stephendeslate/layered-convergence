// [TRACED:SEC-009] $executeRaw with Prisma.sql in production code for RLS context
// [TRACED:CQ-003] No $executeRawUnsafe anywhere in production code

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyContextService {
  constructor(private readonly prisma: PrismaService) {}

  async setCompanyContext(companyId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.company_id', ${companyId}, true)`,
    );
  }
}
