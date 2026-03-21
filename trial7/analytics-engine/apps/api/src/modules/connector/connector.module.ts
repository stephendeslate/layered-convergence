import { Module } from '@nestjs/common';
import { ConnectorController } from './connector.controller';
import { ConnectorService } from './connector.service';
import { PrismaService } from '../../common/prisma.service';
import { DataPointModule } from '../data-point/data-point.module';
import { SyncRunModule } from '../sync-run/sync-run.module';
import { DeadLetterModule } from '../dead-letter/dead-letter.module';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [DataPointModule, SyncRunModule, DeadLetterModule, SseModule],
  controllers: [ConnectorController],
  providers: [ConnectorService, PrismaService],
  exports: [ConnectorService],
})
export class ConnectorModule {}
