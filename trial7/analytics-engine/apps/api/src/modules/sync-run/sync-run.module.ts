import { Module } from '@nestjs/common';
import { SyncRunController } from './sync-run.controller';
import { SyncRunService } from './sync-run.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [SyncRunController],
  providers: [SyncRunService, PrismaService],
  exports: [SyncRunService],
})
export class SyncRunModule {}
