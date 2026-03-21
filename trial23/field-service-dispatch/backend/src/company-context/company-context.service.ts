// TRACED:PRISMA_SQL_TAG — $executeRaw uses Prisma.sql tagged template
// TRACED:EXECUTERAW_SAFE — All $executeRaw calls use Prisma.sql tagged template, never $executeRawUnsafe

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
