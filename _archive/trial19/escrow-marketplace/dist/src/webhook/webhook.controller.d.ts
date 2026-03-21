import { WebhookService } from './webhook.service';
export declare class WebhookController {
    private readonly webhookService;
    constructor(webhookService: WebhookService);
    process(body: {
        idempotencyKey: string;
        event: string;
        payload: any;
    }): Promise<{
        id: string;
        idempotencyKey: string;
        event: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        idempotencyKey: string;
        event: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date;
    }[]>;
    findByKey(key: string): Promise<{
        id: string;
        idempotencyKey: string;
        event: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date;
    } | null>;
}
