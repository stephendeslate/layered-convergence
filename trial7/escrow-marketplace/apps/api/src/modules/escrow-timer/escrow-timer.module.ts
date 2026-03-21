import { Module } from '@nestjs/common';
import { EscrowTimerController } from './escrow-timer.controller';
import { EscrowTimerService } from './escrow-timer.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [EscrowTimerController],
  providers: [EscrowTimerService, PrismaService],
  exports: [EscrowTimerService],
})
export class EscrowTimerModule {}
