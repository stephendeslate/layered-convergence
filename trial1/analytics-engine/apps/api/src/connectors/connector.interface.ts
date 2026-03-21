/**
 * Connector interface — all data source connectors implement this.
 * See SRS-3 section 1.2 for the full specification.
 */

export interface RawRecord {
  [key: string]: unknown;
}

export interface ConnectorError {
  code:
    | 'CONNECTION_REFUSED'
    | 'AUTH_FAILED'
    | 'TIMEOUT'
    | 'INVALID_RESPONSE'
    | 'QUERY_ERROR';
  message: string;
  retryable: boolean;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sampleData?: RawRecord[];
}

export interface Connector {
  /**
   * Test connectivity and return a validation result.
   * Must resolve within 10 seconds (BRD BR-021).
   */
  testConnection(config: Record<string, unknown>): Promise<ValidationResult>;

  /**
   * Extract data from the external source.
   * Yields batches of raw records for memory efficiency.
   * @param config Decrypted connector configuration
   * @param lastSyncCursor Optional cursor for incremental sync
   */
  extract(
    config: Record<string, unknown>,
    lastSyncCursor?: string,
  ): AsyncGenerator<RawRecord[]>;

  /**
   * Get sample data for preview during configuration.
   */
  getSampleData(
    config: Record<string, unknown>,
    limit: number,
  ): Promise<RawRecord[]>;
}
