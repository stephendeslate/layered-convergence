import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { ListingModule } from './listing/listing.module';
import { PrismaService } from './prisma.service';

// TRACED: EM-FC-NEST-001 — NestJS AppModule with domain modules
@Module({
  imports: [AuthModule, TransactionModule, ListingModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
