import { DataPointService } from './datapoint.service.js';
import { CreateDataPointDto } from './dto/create-datapoint.dto.js';
import { QueryDataPointDto } from './dto/query-datapoint.dto.js';
import { Request } from 'express';
export declare class DataPointController {
    private readonly dataPointService;
    constructor(dataPointService: DataPointService);
    create(req: Request, dto: CreateDataPointDto): Promise<{
        id: string;
        createdAt: Date;
        tenantId: string;
        dataSourceId: string;
        timestamp: Date;
        dimensions: import("@prisma/client/runtime/client").JsonValue;
        metrics: import("@prisma/client/runtime/client").JsonValue;
    }>;
    query(req: Request, query: QueryDataPointDto): Promise<Record<string, any> | {
        id: string;
        createdAt: Date;
        tenantId: string;
        dataSourceId: string;
        timestamp: Date;
        dimensions: import("@prisma/client/runtime/client").JsonValue;
        metrics: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
}
