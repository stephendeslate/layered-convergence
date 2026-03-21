import { Module } from '@nestjs/common';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [EscrowController],
  providers: [EscrowService, PrismaService],
})
export class EscrowModule {}
