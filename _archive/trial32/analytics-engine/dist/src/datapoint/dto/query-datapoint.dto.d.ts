export declare class QueryDataPointDto {
    dataSourceId?: string;
    startDate?: string;
    endDate?: string;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
    groupBy?: string;
}
