import { Module } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { SyncRunController } from './sync-run.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [SyncRunController],
  providers: [SyncRunService, PrismaService],
  exports: [SyncRunService],
})
export class SyncRunModule {}
