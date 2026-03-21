import { Module } from "@nestjs/common";
import { WorkOrderController } from "./work-order.controller";
import { WorkOrderService } from "./work-order.service";
import { CompanyModule } from "../company/company.module";
import { PrismaService } from "../common/prisma.service";

@Module({
  imports: [CompanyModule],
  controllers: [WorkOrderController],
  providers: [WorkOrderService, PrismaService],
})
export class WorkOrderModule {}
