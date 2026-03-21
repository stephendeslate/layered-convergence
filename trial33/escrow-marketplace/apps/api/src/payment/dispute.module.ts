import { Module } from '@nestjs/common';
import { DisputeController } from './dispute.controller';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DisputeController],
  providers: [DisputeService, PrismaService],
})
export class DisputeModule {}
