import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [SyncController],
  providers: [SyncService, PrismaService],
  exports: [SyncService],
})
export class SyncModule {}
