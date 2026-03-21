import { Module } from '@nestjs/common';
import { RestApiConnector } from './rest-api.connector';
import { PostgresqlConnector } from './postgresql.connector';
import { CsvConnector } from './csv.connector';
import { WebhookConnector } from './webhook.connector';
import { ConnectorFactory } from './connector.factory';

@Module({
  providers: [
    RestApiConnector,
    PostgresqlConnector,
    CsvConnector,
    WebhookConnector,
    ConnectorFactory,
  ],
  exports: [ConnectorFactory],
})
export class ConnectorsModule {}
