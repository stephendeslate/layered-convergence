import { Module } from '@nestjs/common';
import { CustomerPortalService } from './customer-portal.service';
import { CustomerPortalController } from './customer-portal.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [CustomerPortalController],
  providers: [CustomerPortalService, PrismaService],
  exports: [CustomerPortalService],
})
export class CustomerPortalModule {}
