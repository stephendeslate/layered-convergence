import { Module } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { ConnectorController } from './connector.controller';
import { DataPointModule } from '../data-point/data-point.module';
import { SyncRunModule } from '../sync-run/sync-run.module';
import { DeadLetterModule } from '../dead-letter/dead-letter.module';

@Module({
  imports: [DataPointModule, SyncRunModule, DeadLetterModule],
  controllers: [ConnectorController],
  providers: [ConnectorService],
  exports: [ConnectorService],
})
export class ConnectorModule {}
