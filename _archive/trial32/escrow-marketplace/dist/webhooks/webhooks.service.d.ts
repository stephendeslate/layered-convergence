import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export interface WebhookEvent {
    id: string;
    type: string;
    data: Record<string, any>;
}
export declare class WebhooksService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processEvent(event: WebhookEvent): Promise<{
        processed: boolean;
        message: string;
    }>;
    private handleEvent;
    findAll(limit?: number): Promise<{
        id: string;
        createdAt: Date;
        provider: string;
        idempotencyKey: string;
        eventType: string;
        payload: Prisma.JsonValue;
        processedAt: Date | null;
    }[]>;
    findByEventType(eventType: string): Promise<{
        id: string;
        createdAt: Date;
        provider: string;
        idempotencyKey: string;
        eventType: string;
        payload: Prisma.JsonValue;
        processedAt: Date | null;
    }[]>;
}
