import { Injectable } from '@nestjs/common';
import { Connector } from './connector.interface';
import { RestApiConnector } from './rest-api.connector';
import { PostgresqlConnector } from './postgresql.connector';
import { CsvConnector } from './csv.connector';
import { WebhookConnector } from './webhook.connector';

@Injectable()
export class ConnectorFactory {
  constructor(
    private readonly restApi: RestApiConnector,
    private readonly postgresql: PostgresqlConnector,
    private readonly csv: CsvConnector,
    private readonly webhook: WebhookConnector,
  ) {}

  getConnector(connectorType: string): Connector {
    switch (connectorType) {
      case 'REST_API':
        return this.restApi;
      case 'POSTGRESQL':
        return this.postgresql;
      case 'CSV':
        return this.csv;
      case 'WEBHOOK':
        return this.webhook;
      default:
        throw new Error(`Unknown connector type: ${connectorType}`);
    }
  }

  getWebhookConnector(): WebhookConnector {
    return this.webhook;
  }
}
