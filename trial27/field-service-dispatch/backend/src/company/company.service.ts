// [TRACED:FD-010] Company context set via $executeRaw with Prisma.sql
// [TRACED:FD-029] Parameterized queries via Prisma.sql prevent SQL injection
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async setCompanyContext(companyId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_company_id', ${companyId}, true)`,
    );
  }

  async findById(companyId: string) {
    await this.setCompanyContext(companyId);
    // findFirst: company lookup by ID within RLS context
    return this.prisma.company.findFirst({
      where: { id: companyId },
    });
  }

  async create(data: { name: string; domain: string }) {
    return this.prisma.company.create({
      data: {
        name: data.name,
        domain: data.domain,
      },
    });
  }

  async findAll(companyId: string) {
    await this.setCompanyContext(companyId);
    return this.prisma.company.findMany();
  }
}
