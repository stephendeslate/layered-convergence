import { DataSourceType } from './create-datasource.dto.js';
export declare class UpdateDataSourceDto {
    name?: string;
    type?: DataSourceType;
}
export declare class UpdateDataSourceConfigDto {
    connectionConfig?: Record<string, any>;
    fieldMapping?: Record<string, any>;
    transformSteps?: Record<string, any>;
    syncSchedule?: string;
}
