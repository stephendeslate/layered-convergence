// TRACED: EM-DMOD-001
import { Module } from '@nestjs/common';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DisputesController],
  providers: [DisputesService, PrismaService],
  exports: [DisputesService],
})
export class DisputesModule {}
