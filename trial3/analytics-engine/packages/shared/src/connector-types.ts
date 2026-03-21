export const CONNECTOR_TYPES = {
  API: 'api',
  POSTGRESQL: 'postgresql',
  CSV: 'csv',
  WEBHOOK: 'webhook',
} as const;

export type ConnectorType = (typeof CONNECTOR_TYPES)[keyof typeof CONNECTOR_TYPES];

export const VALID_CONNECTOR_TYPES = Object.values(CONNECTOR_TYPES);

export function isValidConnectorType(type: string): type is ConnectorType {
  return VALID_CONNECTOR_TYPES.includes(type as ConnectorType);
}
