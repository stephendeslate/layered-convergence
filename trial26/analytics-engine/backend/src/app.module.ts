import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { TenantModule } from "./tenant/tenant.module";
import { PrismaModule } from "./common/prisma.module";
import { AnalyticsModule } from "./analytics/analytics.module";

@Module({
  imports: [PrismaModule, AuthModule, TenantModule, AnalyticsModule],
})
export class AppModule {}
