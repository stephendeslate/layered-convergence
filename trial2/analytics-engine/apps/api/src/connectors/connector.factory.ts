import { Injectable } from '@nestjs/common';
import { ConnectorType, Connector } from '@analytics-engine/shared';
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

  get(type: ConnectorType): Connector {
    switch (type) {
      case ConnectorType.REST_API:
        return this.restApi;
      case ConnectorType.POSTGRESQL:
        return this.postgresql;
      case ConnectorType.CSV:
        return this.csv;
      case ConnectorType.WEBHOOK:
        return this.webhook;
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`Unknown connector type: ${exhaustiveCheck}`);
      }
    }
  }

  getWebhookConnector(): WebhookConnector {
    return this.webhook;
  }

  getCsvConnector(): CsvConnector {
    return this.csv;
  }
}
