import { Module } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { CompanyModule } from "../company/company.module";
import { PrismaService } from "../common/prisma.service";

@Module({
  imports: [CompanyModule],
  providers: [InvoiceService, PrismaService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
