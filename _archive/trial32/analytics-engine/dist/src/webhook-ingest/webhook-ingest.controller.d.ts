import { WebhookIngestService } from './webhook-ingest.service.js';
export declare class WebhookIngestController {
    private readonly webhookIngestService;
    constructor(webhookIngestService: WebhookIngestService);
    ingest(apiKey: string, payload: Record<string, any>): Promise<{
        ingested: number;
        syncRunId: string;
    }>;
}
