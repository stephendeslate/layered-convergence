import {
  ConnectorType,
  WidgetType,
  SyncStatus,
  FieldMappingType,
  DataType,
  TransformType,
  FilterOperator,
  GroupByPeriod,
} from './enums';

// --- Field Mapping ---

export interface FieldMapping {
  source: string;
  target: string;
  type: FieldMappingType;
  dataType: DataType;
  jsonPath?: string;
}

// --- Transform Steps ---

export interface RenameTransformStep {
  type: TransformType.RENAME;
  source: string;
  target: string;
}

export interface CastTransformStep {
  type: TransformType.CAST;
  field: string;
  toType: DataType;
}

export interface DeriveTransformStep {
  type: TransformType.DERIVE;
  field: string;
  expression: string;
}

export interface FilterTransformStep {
  type: TransformType.FILTER;
  field: string;
  operator: FilterOperator;
  value: string | number | boolean;
}

export type TransformStep =
  | RenameTransformStep
  | CastTransformStep
  | DeriveTransformStep
  | FilterTransformStep;

// --- Connector Configs ---

export interface RestApiConnectionConfig {
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  responsePath?: string;
  pagination?: {
    type: 'cursor';
    cursorParam: string;
    cursorPath: string;
  };
}

export interface PostgresqlConnectionConfig {
  connectionString: string;
  query: string;
  params?: string[];
  readOnly: boolean;
}

export interface CsvConnectionConfig {
  delimiter: string;
  hasHeader: boolean;
  encoding: string;
  dateFormat?: string;
}

export interface WebhookConnectionConfig {
  webhookUrl: string;
  signatureHeader?: string;
  signatureAlgorithm?: string;
}

export type ConnectionConfig =
  | RestApiConnectionConfig
  | PostgresqlConnectionConfig
  | CsvConnectionConfig
  | WebhookConnectionConfig;

// --- Widget Configs ---

export interface LineChartConfig {
  metric: string;
  dimension: string;
  dateRange: string;
  groupBy?: GroupByPeriod;
  additionalMetrics?: string[];
}

export interface BarChartConfig {
  metric: string;
  dimension: string;
  dateRange: string;
  orientation?: 'vertical' | 'horizontal';
  limit?: number;
}

export interface PieChartConfig {
  metric: string;
  dimension: string;
  dateRange: string;
  donut?: boolean;
  limit?: number;
}

export interface AreaChartConfig {
  metrics: string[];
  dimension: string;
  dateRange: string;
  groupBy?: GroupByPeriod;
  stacked?: boolean;
}

export interface KpiCardConfig {
  metric: string;
  comparisonPeriod?: string;
  dateRange: string;
  format?: string;
  prefix?: string;
  suffix?: string;
}

export interface TableConfig {
  columns: Array<{
    field: string;
    label: string;
    sortable?: boolean;
  }>;
  pageSize?: number;
  dateRange: string;
}

export interface FunnelConfig {
  stages: Array<{
    name: string;
    metric: string;
  }>;
  dateRange: string;
}

export type WidgetConfig =
  | LineChartConfig
  | BarChartConfig
  | PieChartConfig
  | AreaChartConfig
  | KpiCardConfig
  | TableConfig
  | FunnelConfig;

// --- Widget Position & Size ---

export interface WidgetPosition {
  col: number;
  row: number;
}

export interface WidgetSize {
  colSpan: number;
  rowSpan: number;
}

// --- Query ---

export interface QueryFilter {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean;
}

export interface QueryParams {
  dataSourceId: string;
  metrics: string[];
  dimensions?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  groupBy?: GroupByPeriod;
  filters?: QueryFilter[];
  limit?: number;
}

export interface QueryResult {
  data: Record<string, unknown>[];
  meta: {
    totalRows: number;
    cached: boolean;
    queryTimeMs: number;
  };
}

// --- Pagination ---

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// --- Connector Interface ---

export interface FetchResult {
  data: Record<string, unknown>[];
  metadata?: {
    totalRows?: number;
    hasMore?: boolean;
    cursor?: string;
  };
}

export interface Connector {
  validate(config: Record<string, unknown>): Promise<boolean>;
  fetch(config: Record<string, unknown>): Promise<FetchResult>;
}

// --- Branding ---

export interface TenantBranding {
  primaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
}

// --- SSE Events ---

export interface SseConnectedEvent {
  type: 'connected';
  dashboardId: string;
  timestamp: string;
}

export interface SseUpdateEvent {
  type: 'update';
  widgetId: string;
  data: Record<string, unknown>;
}

export interface SseHeartbeatEvent {
  type: 'heartbeat';
  timestamp: string;
}

export type SseEvent = SseConnectedEvent | SseUpdateEvent | SseHeartbeatEvent;

// --- postMessage ---

export interface EmbedFilterMessage {
  type: 'filter';
  dateRange?: string;
  dimensions?: Record<string, string>;
}

export interface EmbedAckMessage {
  type: 'ack';
  received: string;
}

export type EmbedMessage = EmbedFilterMessage | EmbedAckMessage;

// --- Data Record ---

export type DataRecord = Record<string, unknown>;
