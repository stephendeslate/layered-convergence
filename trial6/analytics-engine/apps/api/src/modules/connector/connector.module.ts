import { Module } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { ConnectorController } from './connector.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [ConnectorController],
  providers: [ConnectorService, PrismaService],
  exports: [ConnectorService],
})
export class ConnectorModule {}
