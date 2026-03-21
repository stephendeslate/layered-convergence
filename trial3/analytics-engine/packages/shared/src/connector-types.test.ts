import { describe, it, expect } from 'vitest';
import { isValidConnectorType, CONNECTOR_TYPES, VALID_CONNECTOR_TYPES } from './connector-types';

describe('Connector Types', () => {
  it('should have 4 connector types', () => {
    expect(VALID_CONNECTOR_TYPES).toHaveLength(4);
  });

  it('should validate valid connector types', () => {
    expect(isValidConnectorType('api')).toBe(true);
    expect(isValidConnectorType('postgresql')).toBe(true);
    expect(isValidConnectorType('csv')).toBe(true);
    expect(isValidConnectorType('webhook')).toBe(true);
  });

  it('should reject invalid connector types', () => {
    expect(isValidConnectorType('kafka')).toBe(false);
    expect(isValidConnectorType('s3')).toBe(false);
    expect(isValidConnectorType('')).toBe(false);
  });

  it('should export type constants', () => {
    expect(CONNECTOR_TYPES.API).toBe('api');
    expect(CONNECTOR_TYPES.POSTGRESQL).toBe('postgresql');
    expect(CONNECTOR_TYPES.CSV).toBe('csv');
    expect(CONNECTOR_TYPES.WEBHOOK).toBe('webhook');
  });
});
