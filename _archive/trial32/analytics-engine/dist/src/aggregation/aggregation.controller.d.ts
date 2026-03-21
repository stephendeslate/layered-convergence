import { AggregationService } from './aggregation.service.js';
import { AggregationQueryDto } from './dto/aggregation-query.dto.js';
import { Request } from 'express';
export declare class AggregationController {
    private readonly aggregationService;
    constructor(aggregationService: AggregationService);
    aggregate(req: Request, query: AggregationQueryDto): Promise<{
        bucket: string;
        metrics: Record<string, number>;
    }[]>;
}
