import { WebhooksService } from './webhooks.service';
import { WebhookEventDto } from './dto/webhook-event.dto';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    handleStripeWebhook(dto: WebhookEventDto): Promise<{
        processed: boolean;
        message: string;
    }>;
    findAll(limit?: string): Promise<{
        id: string;
        createdAt: Date;
        provider: string;
        idempotencyKey: string;
        eventType: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date | null;
    }[]>;
    findByType(eventType: string): Promise<{
        id: string;
        createdAt: Date;
        provider: string;
        idempotencyKey: string;
        eventType: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        processedAt: Date | null;
    }[]>;
}
