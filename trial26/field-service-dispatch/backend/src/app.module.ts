import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CompanyModule } from "./company/company.module";
import { PrismaModule } from "./common/prisma.module";
import { WorkOrderModule } from "./work-order/work-order.module";
import { RouteModule } from "./route/route.module";
import { InvoiceModule } from "./invoice/invoice.module";

@Module({
  imports: [PrismaModule, AuthModule, CompanyModule, WorkOrderModule, RouteModule, InvoiceModule],
})
export class AppModule {}
