// TRACED: EM-API-002 — Root application module
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule, ListingsModule, TransactionsModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
