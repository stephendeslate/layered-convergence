import { Module } from "@nestjs/common";
import { RouteService } from "./route.service";
import { CompanyModule } from "../company/company.module";
import { PrismaService } from "../common/prisma.service";

@Module({
  imports: [CompanyModule],
  providers: [RouteService, PrismaService],
  exports: [RouteService],
})
export class RouteModule {}
