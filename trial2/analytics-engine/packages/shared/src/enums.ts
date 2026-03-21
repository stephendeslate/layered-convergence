export enum ConnectorType {
  REST_API = 'rest_api',
  POSTGRESQL = 'postgresql',
  CSV = 'csv',
  WEBHOOK = 'webhook',
}

export enum WidgetType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  KPI = 'kpi',
  TABLE = 'table',
  FUNNEL = 'funnel',
}

export enum SyncStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum FieldMappingType {
  DIMENSION = 'dimension',
  METRIC = 'metric',
}

export enum DataType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
}

export enum TransformType {
  RENAME = 'rename',
  CAST = 'cast',
  DERIVE = 'derive',
  FILTER = 'filter',
}

export enum FilterOperator {
  EQ = 'eq',
  NOT_EQ = 'not_eq',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
}

export enum GroupByPeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
}

export enum DateRange {
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NINETY_DAYS = '90d',
  CUSTOM = 'custom',
}
