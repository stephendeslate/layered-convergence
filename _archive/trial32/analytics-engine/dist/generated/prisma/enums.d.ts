export declare const WidgetType: {
    readonly LINE_CHART: "LINE_CHART";
    readonly BAR_CHART: "BAR_CHART";
    readonly PIE_CHART: "PIE_CHART";
    readonly AREA_CHART: "AREA_CHART";
    readonly KPI_CARD: "KPI_CARD";
    readonly TABLE: "TABLE";
    readonly FUNNEL: "FUNNEL";
};
export type WidgetType = (typeof WidgetType)[keyof typeof WidgetType];
export declare const DataSourceType: {
    readonly POSTGRESQL: "POSTGRESQL";
    readonly API: "API";
    readonly CSV: "CSV";
    readonly WEBHOOK: "WEBHOOK";
};
export type DataSourceType = (typeof DataSourceType)[keyof typeof DataSourceType];
export declare const SyncRunStatus: {
    readonly RUNNING: "RUNNING";
    readonly COMPLETED: "COMPLETED";
    readonly FAILED: "FAILED";
};
export type SyncRunStatus = (typeof SyncRunStatus)[keyof typeof SyncRunStatus];
