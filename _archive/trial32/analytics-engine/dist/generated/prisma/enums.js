"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncRunStatus = exports.DataSourceType = exports.WidgetType = void 0;
exports.WidgetType = {
    LINE_CHART: 'LINE_CHART',
    BAR_CHART: 'BAR_CHART',
    PIE_CHART: 'PIE_CHART',
    AREA_CHART: 'AREA_CHART',
    KPI_CARD: 'KPI_CARD',
    TABLE: 'TABLE',
    FUNNEL: 'FUNNEL'
};
exports.DataSourceType = {
    POSTGRESQL: 'POSTGRESQL',
    API: 'API',
    CSV: 'CSV',
    WEBHOOK: 'WEBHOOK'
};
exports.SyncRunStatus = {
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};
//# sourceMappingURL=enums.js.map