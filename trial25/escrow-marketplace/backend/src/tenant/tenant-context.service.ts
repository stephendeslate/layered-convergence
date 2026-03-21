import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// [TRACED:SEC-004] TenantContextService sets user context using $executeRaw with Prisma.sql
@Injectable()
export class TenantContextService {
  private readonly logger = new Logger(TenantContextService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sets the user context for RLS policies using $executeRaw with Prisma.sql
   * tagged template. This is production code that runs before every user-scoped query.
   */
  async setUserContext(userId: string): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.user_id', ${userId}, true)`
    );
    this.logger.debug(`User context set to ${userId}`);
  }

  async clearUserContext(): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.user_id', '', true)`
    );
  }
}
