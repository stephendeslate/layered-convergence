import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDataPointDto } from './dto/create-datapoint.dto.js';
import { QueryDataPointDto } from './dto/query-datapoint.dto.js';
export declare class DataPointService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, dto: CreateDataPointDto): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        dataSourceId: string;
        timestamp: Date;
        dimensions: import("@prisma/client/runtime/client").JsonValue;
        metrics: import("@prisma/client/runtime/client").JsonValue;
    }>;
    createMany(tenantId: string, dataSourceId: string, points: Array<{
        timestamp: Date;
        dimensions: Record<string, any>;
        metrics: Record<string, any>;
    }>): Promise<import("../../generated/prisma/internal/prismaNamespace.js").BatchPayload>;
    query(tenantId: string, query: QueryDataPointDto): Promise<Record<string, any> | {
        id: string;
        createdAt: Date;
        tenantId: string;
        dataSourceId: string;
        timestamp: Date;
        dimensions: import("@prisma/client/runtime/client").JsonValue;
        metrics: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    private aggregate;
    private computeAggregation;
}
