export declare enum DataSourceType {
    POSTGRESQL = "POSTGRESQL",
    API = "API",
    CSV = "CSV",
    WEBHOOK = "WEBHOOK"
}
export declare class CreateDataSourceDto {
    name: string;
    type: DataSourceType;
}
export declare class CreateDataSourceConfigDto {
    connectionConfig: Record<string, any>;
    fieldMapping: Record<string, any>;
    transformSteps: Record<string, any>;
    syncSchedule?: string;
}
