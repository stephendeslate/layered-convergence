// TRACED: EM-EMOD-001
import { Module } from '@nestjs/common';
import { EscrowsController } from './escrows.controller';
import { EscrowsService } from './escrows.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EscrowsController],
  providers: [EscrowsService, PrismaService],
  exports: [EscrowsService],
})
export class EscrowsModule {}
