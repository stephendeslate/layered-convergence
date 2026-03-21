// [TRACED:AE-010] Tenant context via $executeRaw with Prisma.sql
// [TRACED:AE-029] set_config with $executeRaw and Prisma.sql
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { Prisma } from "@prisma/client";

// [TRACED:SEC-005] Tenant context service with $executeRaw + Prisma.sql in PRODUCTION
@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    // Using $executeRaw with Prisma.sql tagged template for SQL injection safety
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`
    );
  }

  async clearTenantContext(): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', '', true)`
    );
  }

  async getTenants() {
    return this.prisma.tenant.findMany();
  }

  async createTenant(name: string, slug: string) {
    return this.prisma.tenant.create({
      data: { name, slug },
    });
  }
}
