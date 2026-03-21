import { Module } from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service';
import { StripeAccountController } from './stripe-account.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [StripeAccountController],
  providers: [StripeAccountService, PrismaService],
  exports: [StripeAccountService],
})
export class StripeAccountModule {}
