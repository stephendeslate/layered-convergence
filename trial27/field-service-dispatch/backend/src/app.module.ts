import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CompanyModule } from "./company/company.module";
import { WorkOrderModule } from "./work-order/work-order.module";
import { RouteModule } from "./route/route.module";
import { InvoiceModule } from "./invoice/invoice.module";
import { PrismaService } from "./common/prisma.service";

@Module({
  imports: [
    AuthModule,
    CompanyModule,
    WorkOrderModule,
    RouteModule,
    InvoiceModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
