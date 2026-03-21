"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonNullValueFilter = exports.NullsOrder = exports.QueryMode = exports.NullableJsonNullValueInput = exports.JsonNullValueInput = exports.SortOrder = exports.DeadLetterEventScalarFieldEnum = exports.QueryCacheScalarFieldEnum = exports.EmbedConfigScalarFieldEnum = exports.DataPointScalarFieldEnum = exports.SyncRunScalarFieldEnum = exports.DataSourceConfigScalarFieldEnum = exports.DataSourceScalarFieldEnum = exports.WidgetScalarFieldEnum = exports.DashboardScalarFieldEnum = exports.TenantScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.Decimal = void 0;
const runtime = __importStar(require("@prisma/client/runtime/index-browser"));
exports.Decimal = runtime.Decimal;
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    Tenant: 'Tenant',
    Dashboard: 'Dashboard',
    Widget: 'Widget',
    DataSource: 'DataSource',
    DataSourceConfig: 'DataSourceConfig',
    SyncRun: 'SyncRun',
    DataPoint: 'DataPoint',
    EmbedConfig: 'EmbedConfig',
    QueryCache: 'QueryCache',
    DeadLetterEvent: 'DeadLetterEvent'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.TenantScalarFieldEnum = {
    id: 'id',
    name: 'name',
    apiKey: 'apiKey',
    primaryColor: 'primaryColor',
    fontFamily: 'fontFamily',
    logoUrl: 'logoUrl',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.DashboardScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    layout: 'layout',
    isPublished: 'isPublished',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.WidgetScalarFieldEnum = {
    id: 'id',
    dashboardId: 'dashboardId',
    type: 'type',
    config: 'config',
    positionX: 'positionX',
    positionY: 'positionY',
    width: 'width',
    height: 'height',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.DataSourceScalarFieldEnum = {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    type: 'type',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.DataSourceConfigScalarFieldEnum = {
    id: 'id',
    dataSourceId: 'dataSourceId',
    connectionConfig: 'connectionConfig',
    fieldMapping: 'fieldMapping',
    transformSteps: 'transformSteps',
    syncSchedule: 'syncSchedule',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.SyncRunScalarFieldEnum = {
    id: 'id',
    dataSourceId: 'dataSourceId',
    status: 'status',
    rowsIngested: 'rowsIngested',
    errorLog: 'errorLog',
    startedAt: 'startedAt',
    completedAt: 'completedAt'
};
exports.DataPointScalarFieldEnum = {
    id: 'id',
    dataSourceId: 'dataSourceId',
    tenantId: 'tenantId',
    timestamp: 'timestamp',
    dimensions: 'dimensions',
    metrics: 'metrics',
    createdAt: 'createdAt'
};
exports.EmbedConfigScalarFieldEnum = {
    id: 'id',
    dashboardId: 'dashboardId',
    allowedOrigins: 'allowedOrigins',
    themeOverrides: 'themeOverrides',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.QueryCacheScalarFieldEnum = {
    id: 'id',
    queryHash: 'queryHash',
    result: 'result',
    expiresAt: 'expiresAt'
};
exports.DeadLetterEventScalarFieldEnum = {
    id: 'id',
    dataSourceId: 'dataSourceId',
    payload: 'payload',
    errorReason: 'errorReason',
    createdAt: 'createdAt',
    retriedAt: 'retriedAt'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.JsonNullValueInput = {
    JsonNull: exports.JsonNull
};
exports.NullableJsonNullValueInput = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.JsonNullValueFilter = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull,
    AnyNull: exports.AnyNull
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map