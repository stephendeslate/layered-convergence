// TRACED: EM-TMOD-001
import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
