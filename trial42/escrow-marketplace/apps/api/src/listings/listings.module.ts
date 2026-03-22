// TRACED: EM-LMOD-001
import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ListingsController],
  providers: [ListingsService, PrismaService],
  exports: [ListingsService],
})
export class ListingsModule {}
