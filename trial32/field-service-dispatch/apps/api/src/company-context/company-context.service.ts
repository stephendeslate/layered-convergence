// [TRACED:FD-SM-007] CompanyContextService sets RLS variable via $executeRaw
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyContextService {
  constructor(private readonly prisma: PrismaService) {}

  async setCompanyContext(companyId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.company_id', ${companyId}, true)`,
    );
  }
}
