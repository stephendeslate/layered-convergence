import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// [TRACED:SEC-005] Company context service sets RLS session variables using $executeRaw with tagged templates
@Injectable()
export class CompanyContextService {
  constructor(private readonly prisma: PrismaService) {}

  async setCompanyContext(companyId: string): Promise<void> {
    // Uses $executeRaw with Prisma.sql tagged template (NOT $executeRawUnsafe — FM #59)
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.company_id', ${companyId}, true)`,
    );
  }

  async setUserContext(userId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.user_id', ${userId}, true)`,
    );
  }
}
