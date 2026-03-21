import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client-runtime-utils").DbNullClass;
export declare const JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
export declare const AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
export declare const ModelName: {
    readonly Tenant: "Tenant";
    readonly Dashboard: "Dashboard";
    readonly Widget: "Widget";
    readonly DataSource: "DataSource";
    readonly DataSourceConfig: "DataSourceConfig";
    readonly SyncRun: "SyncRun";
    readonly DataPoint: "DataPoint";
    readonly EmbedConfig: "EmbedConfig";
    readonly QueryCache: "QueryCache";
    readonly DeadLetterEvent: "DeadLetterEvent";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const TenantScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly apiKey: "apiKey";
    readonly primaryColor: "primaryColor";
    readonly fontFamily: "fontFamily";
    readonly logoUrl: "logoUrl";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum];
export declare const DashboardScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly name: "name";
    readonly layout: "layout";
    readonly isPublished: "isPublished";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type DashboardScalarFieldEnum = (typeof DashboardScalarFieldEnum)[keyof typeof DashboardScalarFieldEnum];
export declare const WidgetScalarFieldEnum: {
    readonly id: "id";
    readonly dashboardId: "dashboardId";
    readonly type: "type";
    readonly config: "config";
    readonly positionX: "positionX";
    readonly positionY: "positionY";
    readonly width: "width";
    readonly height: "height";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type WidgetScalarFieldEnum = (typeof WidgetScalarFieldEnum)[keyof typeof WidgetScalarFieldEnum];
export declare const DataSourceScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly name: "name";
    readonly type: "type";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type DataSourceScalarFieldEnum = (typeof DataSourceScalarFieldEnum)[keyof typeof DataSourceScalarFieldEnum];
export declare const DataSourceConfigScalarFieldEnum: {
    readonly id: "id";
    readonly dataSourceId: "dataSourceId";
    readonly connectionConfig: "connectionConfig";
    readonly fieldMapping: "fieldMapping";
    readonly transformSteps: "transformSteps";
    readonly syncSchedule: "syncSchedule";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type DataSourceConfigScalarFieldEnum = (typeof DataSourceConfigScalarFieldEnum)[keyof typeof DataSourceConfigScalarFieldEnum];
export declare const SyncRunScalarFieldEnum: {
    readonly id: "id";
    readonly dataSourceId: "dataSourceId";
    readonly status: "status";
    readonly rowsIngested: "rowsIngested";
    readonly errorLog: "errorLog";
    readonly startedAt: "startedAt";
    readonly completedAt: "completedAt";
};
export type SyncRunScalarFieldEnum = (typeof SyncRunScalarFieldEnum)[keyof typeof SyncRunScalarFieldEnum];
export declare const DataPointScalarFieldEnum: {
    readonly id: "id";
    readonly dataSourceId: "dataSourceId";
    readonly tenantId: "tenantId";
    readonly timestamp: "timestamp";
    readonly dimensions: "dimensions";
    readonly metrics: "metrics";
    readonly createdAt: "createdAt";
};
export type DataPointScalarFieldEnum = (typeof DataPointScalarFieldEnum)[keyof typeof DataPointScalarFieldEnum];
export declare const EmbedConfigScalarFieldEnum: {
    readonly id: "id";
    readonly dashboardId: "dashboardId";
    readonly allowedOrigins: "allowedOrigins";
    readonly themeOverrides: "themeOverrides";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type EmbedConfigScalarFieldEnum = (typeof EmbedConfigScalarFieldEnum)[keyof typeof EmbedConfigScalarFieldEnum];
export declare const QueryCacheScalarFieldEnum: {
    readonly id: "id";
    readonly queryHash: "queryHash";
    readonly result: "result";
    readonly expiresAt: "expiresAt";
};
export type QueryCacheScalarFieldEnum = (typeof QueryCacheScalarFieldEnum)[keyof typeof QueryCacheScalarFieldEnum];
export declare const DeadLetterEventScalarFieldEnum: {
    readonly id: "id";
    readonly dataSourceId: "dataSourceId";
    readonly payload: "payload";
    readonly errorReason: "errorReason";
    readonly createdAt: "createdAt";
    readonly retriedAt: "retriedAt";
};
export type DeadLetterEventScalarFieldEnum = (typeof DeadLetterEventScalarFieldEnum)[keyof typeof DeadLetterEventScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: import("@prisma/client-runtime-utils").DbNullClass;
    readonly JsonNull: import("@prisma/client-runtime-utils").JsonNullClass;
    readonly AnyNull: import("@prisma/client-runtime-utils").AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
