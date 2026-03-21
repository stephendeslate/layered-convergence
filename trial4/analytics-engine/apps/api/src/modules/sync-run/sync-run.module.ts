import { Module } from '@nestjs/common';
import { SyncRunService } from './sync-run.service';
import { SyncRunController } from './sync-run.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SyncRunController],
  providers: [SyncRunService],
  exports: [SyncRunService],
})
export class SyncRunModule {}
