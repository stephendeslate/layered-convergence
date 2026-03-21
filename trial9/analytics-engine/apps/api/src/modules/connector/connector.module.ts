import { Module } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { ConnectorController } from './connector.controller';
import { PrismaService } from '../../config/prisma.service';
import { SyncRunModule } from '../sync-run/sync-run.module';
import { DataPointModule } from '../data-point/data-point.module';
import { DeadLetterModule } from '../dead-letter/dead-letter.module';

@Module({
  imports: [SyncRunModule, DataPointModule, DeadLetterModule],
  controllers: [ConnectorController],
  providers: [ConnectorService, PrismaService],
  exports: [ConnectorService],
})
export class ConnectorModule {}
