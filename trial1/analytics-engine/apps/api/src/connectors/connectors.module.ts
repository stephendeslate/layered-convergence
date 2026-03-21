import { Module, Global } from '@nestjs/common';
import { RestApiConnector } from './rest-api.connector';
import { PostgresqlConnector } from './postgresql.connector';
import { CsvConnector } from './csv.connector';
import { WebhookConnector } from './webhook.connector';
import { ConnectorFactory } from './connector.factory';

@Global()
@Module({
  providers: [
    RestApiConnector,
    PostgresqlConnector,
    CsvConnector,
    WebhookConnector,
    ConnectorFactory,
  ],
  exports: [ConnectorFactory, WebhookConnector],
})
export class ConnectorsModule {}
