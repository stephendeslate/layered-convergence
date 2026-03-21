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

  async setUserContext(userId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.user_id', ${userId}, true)`,
    );
  }
}
