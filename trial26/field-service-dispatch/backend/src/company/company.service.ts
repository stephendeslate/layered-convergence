// [TRACED:FD-010] Company context via $executeRaw with Prisma.sql
// [TRACED:FD-033] set_config with Prisma.sql tagged templates
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { Prisma } from "@prisma/client";

// [TRACED:SEC-005] Company context service with $executeRaw + Prisma.sql in PRODUCTION
@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async setCompanyContext(companyId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_company_id', ${companyId}, true)`
    );
  }

  async clearCompanyContext(): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_company_id', '', true)`
    );
  }

  async getCompanies() {
    return this.prisma.company.findMany();
  }

  async createCompany(name: string, slug: string) {
    return this.prisma.company.create({ data: { name, slug } });
  }
}
