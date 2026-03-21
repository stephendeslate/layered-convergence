import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// [TRACED:SEC-006] Tenant context service sets RLS user context via $executeRaw
// [TRACED:SA-005] $executeRaw with Prisma.sql tagged template in production code
@Injectable()
export class TenantContextService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sets the current user context for PostgreSQL Row Level Security.
   * This MUST be called before any tenant-scoped database operation
   * so that RLS policies can filter rows to the authenticated user.
   */
  async setCurrentUser(userId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
    );
  }

  /**
   * Clears the current user context after a request completes.
   * Prevents context leakage between requests.
   */
  async clearCurrentUser(): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_user_id', '', true)`,
    );
  }
}
