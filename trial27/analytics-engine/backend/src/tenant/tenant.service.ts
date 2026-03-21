// [TRACED:AE-010] Tenant context set via $executeRaw with Prisma.sql
// [TRACED:AE-029] Tenant isolation using RLS context variable
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
  }

  async findAll() {
    return this.prisma.tenant.findMany();
  }

  async create(data: { name: string; slug: string }) {
    return this.prisma.tenant.create({ data });
  }
}
