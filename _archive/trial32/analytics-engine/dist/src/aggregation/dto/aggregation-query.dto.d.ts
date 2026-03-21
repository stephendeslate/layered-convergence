export declare enum TimeBucket {
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly"
}
export declare class AggregationQueryDto {
    dataSourceId: string;
    bucket: TimeBucket;
    startDate?: string;
    endDate?: string;
    metricKey?: string;
}
