import { PrismaService } from '../prisma/prisma.service.js';
import { TimeBucket } from './dto/aggregation-query.dto.js';
export declare class AggregationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    aggregate(tenantId: string, dataSourceId: string, bucket: TimeBucket, startDate?: string, endDate?: string, metricKey?: string): Promise<{
        bucket: string;
        metrics: Record<string, number>;
    }[]>;
    private bucketize;
    private getBucketKey;
    private sumMetrics;
}
