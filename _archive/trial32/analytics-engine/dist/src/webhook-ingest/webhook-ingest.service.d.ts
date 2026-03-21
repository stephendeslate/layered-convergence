import { PrismaService } from '../prisma/prisma.service.js';
import { DataPointService } from '../datapoint/datapoint.service.js';
import { PipelineService } from '../pipeline/pipeline.service.js';
export declare class WebhookIngestService {
    private readonly prisma;
    private readonly dataPointService;
    private readonly pipelineService;
    constructor(prisma: PrismaService, dataPointService: DataPointService, pipelineService: PipelineService);
    ingest(apiKey: string, payload: Record<string, any>): Promise<{
        ingested: number;
        syncRunId: string;
    }>;
}
